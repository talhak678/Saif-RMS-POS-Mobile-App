import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
    return (
        <View style={styles.wrapper}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
        gap: 8,
    },
    icon: { flexShrink: 0 },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
        paddingVertical: 0,
    },
});
