import apiClient from "@/src/api/apiClient";
import ItemCard, { AddItemCard } from "@/src/components/menu/ItemCard";
import { useTheme } from "@/src/context/ThemeContext";
import { C } from "@/theme/colors";
import { GroupedItems, IMenuItem } from "@/types/menuitem.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MenuItemsScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const fetchMenuItems = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const res = await apiClient.get("/menu-items");
            if (res.data?.success) {
                const grouped: GroupedItems = {};
                res.data.data.forEach((item: IMenuItem) => {
                    const catId = item.category?.id || "uncategorized";
                    if (!grouped[catId]) {
                        grouped[catId] = {
                            info: item.category || { id: "uncategorized", name: "Uncategorized" },
                            items: [],
                        };
                    }
                    grouped[catId].items.push(item);
                });
                setGroupedItems(grouped);
                // Expand all by default
                setExpandedCategories(new Set(Object.keys(grouped)));
            }
        } catch { /* silent error handle */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchMenuItems(); }, [fetchMenuItems]);

    const handleToggleAvailability = async (item: IMenuItem) => {
        const newVal = !item.isAvailable;
        // Optimistic Update
        setGroupedItems(prev => {
            const next = { ...prev };
            const catId = item.category?.id || "uncategorized";
            if (next[catId]) {
                next[catId] = {
                    ...next[catId],
                    items: next[catId].items.map(i => i.id === item.id ? { ...i, isAvailable: newVal } : i),
                };
            }
            return next;
        });

        try {
            await apiClient.put(`/menu-items/${item.id}`, {
                name: item.name,
                description: item.description,
                price: parseFloat(String(item.price)) || 0,
                image: item.image ?? "",
                categoryId: item.categoryId,
                isAvailable: newVal,
                variations: item.variations.map(v => ({ ...(v.id ? { id: v.id } : {}), name: v.name, price: parseFloat(String(v.price)) || 0 })),
                addons: item.addons.map(a => ({ ...(a.id ? { id: a.id } : {}), name: a.name, price: parseFloat(String(a.price)) || 0 })),
            });
        } catch {
            // Revert on error
            fetchMenuItems(true);
        }
    };

    const toggleCategory = (catId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId); else next.add(catId);
            return next;
        });
    };

    const sortedCatIds = Object.keys(groupedItems).sort((a, b) =>
        groupedItems[a].info.name.localeCompare(groupedItems[b].info.name)
    );

    return (
        <View style={[s.root, { backgroundColor: C.screenBg[scheme] }]}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}
                >
                    <Ionicons name="arrow-back" size={20} color={C.text[scheme]} />
                </TouchableOpacity>

                <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Menu Items</Text>

                <TouchableOpacity
                    onPress={() => router.push("/menu/items/new" as any)}
                    style={[s.addBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={s.addBtnText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            {loading ? (
                <View style={s.loaderWrap}>
                    <ActivityIndicator size="large" color={C.primary[scheme]} />
                    <Text style={[s.loadingText, { color: C.secondary[scheme] }]}>Loading Menu...</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMenuItems(true)}
                            tintColor={C.primary[scheme]}
                            colors={[C.primary[scheme]]}
                        />
                    }
                >
                    {sortedCatIds.length === 0 ? (
                        <View style={s.emptyWrap}>
                            <Ionicons name="fast-food-outline" size={56} color={C.secondary[scheme]} />
                            <Text style={[s.emptyTitle, { color: C.text[scheme] }]}>No menu items yet</Text>
                            <Text style={[s.emptySub, { color: C.secondary[scheme] }]}>Add categories first, then add items</Text>
                            <TouchableOpacity
                                onPress={() => router.push("/menu/items/new" as any)}
                                style={[s.emptyBtn, { backgroundColor: C.primary[scheme] }]}
                            >
                                <Text style={s.emptyBtnText}>+ Add First Item</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        sortedCatIds.map(catId => {
                            const group = groupedItems[catId];
                            const isExpanded = expandedCategories.has(catId);
                            return (
                                <View key={catId} style={s.section}>
                                    {/* Category Section Header */}
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => toggleCategory(catId)}
                                        style={[s.sectionHeader, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}
                                    >
                                        <Ionicons
                                            name={isExpanded ? "chevron-down" : "chevron-forward"}
                                            size={20} color={C.text[scheme]}
                                        />
                                        <Text style={[s.sectionTitle, { color: C.text[scheme] }]}>{group.info.name}</Text>
                                        <View style={[s.sectionBadge, { backgroundColor: C.primary[scheme] + "15" }]}>
                                            <Text style={[s.sectionBadgeText, { color: C.primary[scheme] }]}>{group.items.length} items</Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => router.push({ pathname: "/menu/items/new" as any, params: { categoryId: catId } })}
                                            style={[s.sectionAddBtn, { backgroundColor: C.primary[scheme] + "10" }]}
                                        >
                                            <Ionicons name="add" size={14} color={C.primary[scheme]} />
                                            <Text style={[s.sectionAddText, { color: C.primary[scheme] }]}>Add Item</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>

                                    {/* Horizontal Scroll of Item Cards */}
                                    {isExpanded && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={s.cardsRow}
                                        >
                                            {group.items.map(item => (
                                                <ItemCard
                                                    key={item.id}
                                                    item={item}
                                                    onToggleAvailability={handleToggleAvailability}
                                                />
                                            ))}
                                            <AddItemCard
                                                onPress={() => router.push({ pathname: "/menu/items/new" as any, params: { categoryId: catId } })}
                                            />
                                        </ScrollView>
                                    )}
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? 40 : 52,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 14,
        gap: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "800",
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
    },
    addBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    loaderWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingTop: 80,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: "600",
    },
    emptyWrap: {
        alignItems: "center",
        paddingVertical: 100,
        gap: 12,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 19,
        fontWeight: "800",
    },
    emptySub: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        opacity: 0.8,
    },
    emptyBtn: {
        marginTop: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
    },
    emptyBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        padding: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 10,
        marginTop: 8,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "800",
    },
    sectionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    sectionBadgeText: {
        fontSize: 12,
        fontWeight: "800",
    },
    sectionAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    sectionAddText: {
        fontSize: 12,
        fontWeight: "800",
    },
    cardsRow: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 0, // spacing is handled by card margin
    },
});
