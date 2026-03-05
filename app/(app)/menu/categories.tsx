import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import CategoryCard, { AddCategoryCard } from "@/src/components/menu/CategoryCard";
import CategoryDetailSheet from "@/src/components/menu/CategoryDetailSheet";
import CategoryForm from "@/src/components/menu/CategoryForm";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { ICategory, ICategoryForm } from "@/types/category.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type SheetMode = "add" | "edit" | "detail" | null;

export default function CategoriesScreen() {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sheetMode, setSheetMode] = useState<SheetMode>(null);
    const [selected, setSelected] = useState<ICategory | null>(null);

    const fetchCategories = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const res = await apiClient.get("/categories");
            if (res.data?.success) {
                const sorted = [...res.data.data].sort(
                    (a: ICategory, b: ICategory) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setCategories(sorted);
            }
        } catch { /* silent */ } finally {
            setLoading(false); setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleAdd = async (form: ICategoryForm) => {
        await apiClient.post("/categories", {
            name: form.name.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            restaurantId: user?.restaurantId ?? "",
        });
        setSheetMode(null);
        fetchCategories(true);
    };

    const handleEdit = async (form: ICategoryForm) => {
        if (!selected) return;
        await apiClient.put(`/categories/${selected.id}`, {
            name: form.name.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            restaurantId: selected.restaurantId,
        });
        setSheetMode(null);
        setSelected(null);
        fetchCategories(true);
    };

    const handleDelete = async (cat: ICategory) => {
        try {
            await apiClient.delete(`/categories/${cat.id}`);
            setSheetMode(null);
            setSelected(null);
            fetchCategories(true);
        } catch { /* silent */ }
    };

    const data: (ICategory | "add")[] = [...categories, "add"];

    const renderItem = ({ item }: { item: ICategory | "add" }) => {
        if (item === "add") return <AddCategoryCard onPress={() => setSheetMode("add")} />;
        return (
            <CategoryCard
                category={item}
                onEdit={cat => { setSelected(cat); setSheetMode("edit"); }}
                onDelete={handleDelete}
                onView={cat => { setSelected(cat); setSheetMode("detail"); }}
            />
        );
    };

    return (
        <View style={[s.root, { backgroundColor: colors.background }]}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>

                <Text style={[s.headerTitle, { color: colors.text }]}>Categories</Text>

                <View style={[s.countBadge, { backgroundColor: Colors.primary + "20" }]}>
                    <Text style={s.countText}>{categories.length}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setSheetMode("add")}
                    style={[s.addBtn, { backgroundColor: Colors.primary }]}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={s.addBtnText}>Add</Text>
                </TouchableOpacity>
            </View>

            {/* ── Content ────────────────────────────────────────────────────────── */}
            {loading ? (
                <View style={s.loaderWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[s.loadingText, { color: colors.secondary }]}>Loading categories…</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item === "add" ? "add" : (item as ICategory).id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={s.columnWrapper}
                    contentContainerStyle={s.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing}
                            onRefresh={() => fetchCategories(true)}
                            colors={[Colors.primary]} tintColor={Colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <Ionicons name="grid-outline" size={56} color={colors.secondary} />
                            <Text style={[s.emptyTitle, { color: colors.text }]}>No categories yet</Text>
                            <Text style={[s.emptySub, { color: colors.secondary }]}>
                                Create your first category to organize your menu
                            </Text>
                            <TouchableOpacity onPress={() => setSheetMode("add")}
                                style={[s.emptyBtn, { backgroundColor: Colors.primary }]}>
                                <Text style={s.emptyBtnText}>Add First Category</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            )}

            {/* ── Bottom Sheet Modal ──────────────────────────────────────────────── */}
            <Modal
                visible={sheetMode !== null}
                transparent
                animationType="slide"
                onRequestClose={() => { setSheetMode(null); setSelected(null); }}
            >
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1}
                    onPress={() => { setSheetMode(null); setSelected(null); }} />
                <View style={[s.modalSheet, { backgroundColor: colors.card }]}>
                    {sheetMode === "detail" && selected && (
                        <CategoryDetailSheet
                            category={selected}
                            onEdit={() => setSheetMode("edit")}
                            onDelete={() => handleDelete(selected)}
                            onClose={() => { setSheetMode(null); setSelected(null); }}
                        />
                    )}
                    {sheetMode === "add" && (
                        <CategoryForm
                            title="Add Category" submitLabel="Add Category"
                            onSubmit={handleAdd}
                            onClose={() => setSheetMode(null)}
                        />
                    )}
                    {sheetMode === "edit" && selected && (
                        <CategoryForm
                            title="Edit Category" submitLabel="Save Changes"
                            initial={{ name: selected.name, description: selected.description ?? "", image: selected.image ?? "" }}
                            onSubmit={handleEdit}
                            onClose={() => { setSheetMode(null); setSelected(null); }}
                        />
                    )}
                </View>
            </Modal>
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
        paddingBottom: 12,
        gap: 10,
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
    countBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    countText: {
        fontSize: 13,
        fontWeight: "800",
        color: Colors.primary,
    },
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    listContent: { paddingHorizontal: 14, paddingTop: 4 },
    columnWrapper: { gap: 12, marginBottom: 12 },
    loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontSize: 14 },
    emptyWrap: { alignItems: "center", paddingVertical: 80, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: "800" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19, paddingHorizontal: 30 },
    emptyBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "85%", minHeight: "55%" },
});
