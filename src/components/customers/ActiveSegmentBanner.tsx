import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActiveSegmentBannerProps {
    label: string;
    count: number;
    onClear: () => void;
}

export default function ActiveSegmentBanner({
    label,
    count,
    onClear,
}: ActiveSegmentBannerProps) {
    return (
        <View style={styles.banner}>
            <Ionicons name="filter" size={14} color={Colors.primary} />
            <Text style={styles.text} numberOfLines={1}>
                Filtering by: <Text style={styles.bold}>{label}</Text> — {count} customers
            </Text>
            <TouchableOpacity onPress={onClear} style={styles.clearBtn} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef0fb",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary + "40",
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 10,
        gap: 8,
    },
    text: {
        flex: 1,
        fontSize: 12,
        color: "#374151",
        fontWeight: "500",
    },
    bold: {
        fontWeight: "700",
        color: Colors.primary,
    },
    clearBtn: {
        padding: 2,
    },
});
