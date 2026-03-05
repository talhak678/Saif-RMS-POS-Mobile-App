import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { ICategory } from "@/types/category.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    visible: boolean;
    categories: ICategory[];
    selectedId: string;
    onSelect: (id: string) => void;
    onClose: () => void;
}

export default function CategoryPicker({ visible, categories, selectedId, onSelect, onClose }: Props) {
    const { colors, isDark } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
            <View style={[s.sheet, { backgroundColor: colors.card }]}>
                <View style={s.handle} />
                <View style={[s.header, { borderBottomColor: colors.border }]}>
                    <Text style={[s.title, { color: colors.text }]}>Select Category</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={categories}
                    keyExtractor={c => c.id}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    renderItem={({ item }) => {
                        const isSelected = item.id === selectedId;
                        return (
                            <TouchableOpacity
                                onPress={() => { onSelect(item.id); onClose(); }}
                                style={[s.row, { borderBottomColor: colors.border }]}
                            >
                                <View style={[s.dot, { backgroundColor: isSelected ? Colors.primary : "transparent", borderColor: Colors.primary }]} />
                                <Text style={[s.rowText, { color: colors.text, fontWeight: isSelected ? "800" : "500" }]}>
                                    {item.name}
                                </Text>
                                {isSelected && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <Text style={[s.empty, { color: colors.secondary }]}>No categories found</Text>
                    }
                />
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "70%", paddingHorizontal: 20 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#9ca3af", alignSelf: "center", marginTop: 10 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1 },
    title: { fontSize: 17, fontWeight: "800" },
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
    dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
    rowText: { flex: 1, fontSize: 15 },
    empty: { textAlign: "center", paddingVertical: 30, fontSize: 14 },
});
