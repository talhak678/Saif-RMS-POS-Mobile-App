import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { ICategory } from "@/types/category.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    category: ICategory;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function CategoryDetailSheet({ category, onEdit, onDelete, onClose }: Props) {
    const { colors, isDark } = useTheme();
    const count = category._count?.menuItems ?? 0;

    const confirmDelete = () => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${category.name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: onDelete },
            ]
        );
    };

    const createdAt = new Date(category.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });

    return (
        <View style={{ flex: 1 }}>
            <View style={s.handle} />

            {/* Close */}
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>

            {/* Image */}
            {category.image ? (
                <Image source={{ uri: category.image }} style={[s.image]} resizeMode="cover" />
            ) : (
                <View style={[s.imagePlaceholder, { backgroundColor: isDark ? "#1e2340" : "#eef0fb" }]}>
                    <Ionicons name="restaurant" size={48} color={Colors.primary} />
                </View>
            )}

            <View style={s.body}>
                {/* Name + desc */}
                <Text style={[s.name, { color: colors.text }]}>{category.name}</Text>
                {category.description ? (
                    <Text style={[s.desc, { color: colors.secondary }]}>{category.description}</Text>
                ) : null}

                {/* Stats row */}
                <View style={s.statsRow}>
                    <View style={[s.stat, { backgroundColor: isDark ? "#1e2340" : "#eef0fb" }]}>
                        <Ionicons name="fast-food-outline" size={14} color={Colors.primary} />
                        <Text style={[s.statText, { color: colors.text }]}>{count} Item{count !== 1 ? "s" : ""}</Text>
                    </View>
                    <View style={[s.stat, { backgroundColor: isDark ? "#1e2340" : "#eef0fb" }]}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                        <Text style={[s.statText, { color: colors.text }]}>Created {createdAt}</Text>
                    </View>
                </View>

                {/* Action buttons */}
                <View style={s.btnRow}>
                    <TouchableOpacity style={[s.editBtn, { backgroundColor: Colors.primary }]} onPress={onEdit} activeOpacity={0.85}>
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={s.editBtnText}>Edit Category</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.delBtn, { backgroundColor: isDark ? "#3b1414" : "#fee2e2", borderColor: "#ef4444" }]} onPress={confirmDelete} activeOpacity={0.85}>
                        <Ionicons name="trash" size={16} color="#ef4444" />
                        <Text style={s.delBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#9ca3af", alignSelf: "center", marginTop: 10 },
    closeBtn: { position: "absolute", top: 16, right: 20, zIndex: 10, padding: 4 },
    image: { width: "100%", height: 200, borderRadius: 0 },
    imagePlaceholder: { width: "100%", height: 180, alignItems: "center", justifyContent: "center", borderRadius: 0 },
    body: { padding: 20, gap: 12 },
    name: { fontSize: 22, fontWeight: "800" },
    desc: { fontSize: 14, lineHeight: 21 },
    statsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    stat: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    statText: { fontSize: 13, fontWeight: "600" },
    btnRow: { flexDirection: "row", gap: 12, marginTop: 6 },
    editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14 },
    editBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
    delBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5 },
    delBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
});
