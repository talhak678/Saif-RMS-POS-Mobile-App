import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { ICategory } from "@/types/category.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    category: ICategory;
    onEdit: (cat: ICategory) => void;
    onDelete: (cat: ICategory) => void;
    onView: (cat: ICategory) => void;
}

export default function CategoryCard({ category, onEdit, onDelete, onView }: Props) {
    const { colors, isDark } = useTheme();
    const count = category._count?.menuItems ?? 0;

    const confirmDelete = () => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(category) },
            ]
        );
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onView(category)}
            style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
            {/* Action buttons */}
            <View style={s.actions}>
                <TouchableOpacity
                    onPress={() => onEdit(category)}
                    style={[s.actionBtn, { backgroundColor: isDark ? "#1e2340" : "#eef0fb" }]}
                    hitSlop={6}
                >
                    <Ionicons name="pencil" size={13} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={confirmDelete}
                    style={[s.actionBtn, { backgroundColor: isDark ? "#3b1414" : "#fee2e2" }]}
                    hitSlop={6}
                >
                    <Ionicons name="trash" size={13} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Image */}
            {category.image ? (
                <Image source={{ uri: category.image }} style={s.img} />
            ) : (
                <View style={[s.imgPlaceholder, { backgroundColor: isDark ? "#1e2340" : "#eef0fb" }]}>
                    <Ionicons name="restaurant" size={28} color={Colors.primary} />
                </View>
            )}

            {/* Name */}
            <Text style={[s.name, { color: colors.text }]} numberOfLines={2}>
                {category.name}
            </Text>

            {/* Count badge */}
            <View style={[s.badge, { backgroundColor: Colors.primary + "20" }]}>
                <Text style={s.badgeText}>{count} item{count !== 1 ? "s" : ""}</Text>
            </View>
        </TouchableOpacity>
    );
}

// "Add New" dashed placeholder card
export function AddCategoryCard({ onPress }: { onPress: () => void }) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            style={[s.card, s.addCard, { borderColor: colors.border }]}
        >
            <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
            <Text style={[s.addText, { color: Colors.primary }]}>Add New</Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        padding: 14,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        minHeight: 160,
    },
    actions: { flexDirection: "row", gap: 8, alignSelf: "flex-end" },
    actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    img: { width: 64, height: 64, borderRadius: 14, marginTop: 2 },
    imgPlaceholder: { width: 64, height: 64, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
    name: { fontSize: 13, fontWeight: "700", textAlign: "center" },
    badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: "700", color: Colors.primary },
    addCard: { borderStyle: "dashed", borderWidth: 2, justifyContent: "center", backgroundColor: "transparent" },
    addText: { fontSize: 13, fontWeight: "700" },
});
