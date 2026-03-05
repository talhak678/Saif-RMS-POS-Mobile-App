import { useTheme } from "@/src/context/ThemeContext";
import { IAddon } from "@/types/menuitem.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
    addon: IAddon;
    index: number;
    onChange: (index: number, field: "name" | "price", value: string) => void;
    onRemove: (index: number) => void;
}

export default function AddonRow({ addon, index, onChange, onRemove }: Props) {
    const { colors, isDark } = useTheme();
    const inputBg = isDark ? "#374151" : "#f3f4f6";
    return (
        <View style={s.row}>
            <TextInput
                style={[s.nameInput, { backgroundColor: inputBg, borderColor: colors.border, color: colors.text }]}
                value={addon.name}
                onChangeText={v => onChange(index, "name", v)}
                placeholder="e.g. Extra Cheese"
                placeholderTextColor={colors.secondary}
            />
            <View style={[s.priceWrap, { backgroundColor: inputBg, borderColor: colors.border }]}>
                <Text style={[s.currencySign, { color: colors.secondary }]}>Rs.</Text>
                <TextInput
                    style={[s.priceInput, { color: colors.text }]}
                    value={String(addon.price || "")}
                    onChangeText={v => onChange(index, "price", v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                />
            </View>
            <TouchableOpacity onPress={() => onRemove(index)} hitSlop={6}
                style={[s.removeBtn, { backgroundColor: isDark ? "#3b1414" : "#fee2e2" }]}>
                <Ionicons name="trash" size={14} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    nameInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13 },
    priceWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, width: 100 },
    currencySign: { fontSize: 12, fontWeight: "700", marginRight: 3 },
    priceInput: { fontSize: 13, flex: 1 },
    removeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
