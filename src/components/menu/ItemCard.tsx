import { useTheme } from "@/src/context/ThemeContext";
import { C } from "@/theme/colors";
import { IMenuItem } from "@/types/menuitem.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface Props {
    item: IMenuItem;
    onToggleAvailability: (item: IMenuItem) => void;
}

export default function ItemCard({ item, onToggleAvailability }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    const price = typeof item.price === "number" ? item.price : parseFloat(String(item.price));

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/menu/items/${item.id}` as any)}
            style={[
                s.card,
                {
                    backgroundColor: C.cardBg[scheme],
                    borderColor: item.isAvailable ? C.border[scheme] : C.danger[scheme],
                    opacity: item.isAvailable ? 1 : 0.8,
                },
            ]}
        >
            {/* Image Section */}
            <View style={s.imgBox}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={s.img} resizeMode="cover" />
                ) : (
                    <View style={[s.imgPlaceholder, { backgroundColor: C.inputBg[scheme] }]}>
                        <Ionicons name="image-outline" size={32} color={C.secondary[scheme]} />
                    </View>
                )}
                {!item.isAvailable && (
                    <View style={s.unavailableOverlay}>
                        <View style={[s.unavailableBadge, { backgroundColor: C.danger[scheme] }]}>
                            <Text style={s.unavailableText}>UNAVAILABLE</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View style={s.content}>
                <View style={s.titleRow}>
                    <Text style={[s.name, { color: C.text[scheme] }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[s.price, { color: C.primary[scheme] }]}>${price.toLocaleString()}</Text>
                </View>

                {item.description ? (
                    <Text style={[s.desc, { color: C.secondary[scheme] }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}

                {/* Badges */}
                <View style={s.badgeRow}>
                    {item.variations.length > 0 && (
                        <View style={[s.badge, { backgroundColor: isDark ? "#2d3748" : "#f3f4f6" }]}>
                            <Ionicons name="layers-outline" size={12} color={C.secondary[scheme]} />
                            <Text style={[s.badgeText, { color: C.secondary[scheme] }]}>
                                {item.variations.length} Variation{item.variations.length > 1 ? "s" : ""}
                            </Text>
                        </View>
                    )}
                    {item.addons.length > 0 && (
                        <View style={[s.badge, { backgroundColor: isDark ? "#2d3748" : "#f3f4f6" }]}>
                            <Ionicons name="add-circle-outline" size={12} color={C.secondary[scheme]} />
                            <Text style={[s.badgeText, { color: C.secondary[scheme] }]}>
                                {item.addons.length} Add-on{item.addons.length > 1 ? "s" : ""}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

                {/* Status management */}
                <View style={s.toggleRow}>
                    <Text style={[s.toggleLabel, { color: C.secondary[scheme] }]}>Status Management</Text>
                    <Switch
                        value={item.isAvailable}
                        onValueChange={() => onToggleAvailability(item)}
                        trackColor={{ false: C.border[scheme], true: C.primary[scheme] + "80" }}
                        thumbColor={item.isAvailable ? C.primary[scheme] : C.secondary[scheme]}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

// Dashed "Add Item" card
export function AddItemCard({ onPress }: { onPress: () => void }) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[s.card, s.addCard, { borderColor: C.primary[scheme] + "40" }]}
        >
            <Ionicons name="add-circle-outline" size={32} color={C.primary[scheme]} />
            <Text style={[s.addText, { color: C.primary[scheme] }]}>Add Item</Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    card: {
        width: 220,
        borderRadius: 24,
        borderWidth: 2,
        overflow: "hidden",
        marginRight: 14,
    },
    imgBox: {
        height: 160,
        width: '100%',
        position: "relative",
    },
    img: {
        width: "100%",
        height: "100%",
    },
    imgPlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    unavailableOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    unavailableBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    unavailableText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    content: {
        padding: 12,
        gap: 8,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 4,
    },
    name: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
    },
    price: {
        fontSize: 16,
        fontWeight: "900",
    },
    desc: {
        fontSize: 12,
        lineHeight: 18,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 6,
        flexWrap: "wrap",
        marginTop: 2,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    toggleLabel: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: 'uppercase',
    },
    addCard: {
        borderStyle: "dashed",
        width: 130,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        gap: 10,
    },
    addText: {
        fontSize: 14,
        fontWeight: "800",
    },
});
