import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps { value: string; onChangeText: (text: string) => void; placeholder: string; }

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
    const { colors } = useTheme();
    return (
        <View style={[s.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={16} color={colors.secondary} style={s.icon} />
            <TextInput
                style={[s.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.secondary}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    wrapper: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, gap: 8 },
    icon: { flexShrink: 0 },
    input: { flex: 1, fontSize: 14, paddingVertical: 0 },
});
