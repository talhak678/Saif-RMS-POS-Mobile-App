import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
}

export default function StatCard({ label, value, icon, iconColor, iconBg }: StatCardProps) {
    return (
        <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        gap: 6,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
    },
    value: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.3,
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6B7280",
        letterSpacing: 0.2,
    },
});
