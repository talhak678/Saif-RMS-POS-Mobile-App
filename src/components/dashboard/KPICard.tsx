import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface KPICardProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    growth?: number | null;
}

function GrowthBadge({ growth }: { growth?: number | null }) {
    if (growth === undefined || growth === null) {
        return <Text style={styles.growthNeutral}>—</Text>;
    }
    if (growth === 0) {
        return <Text style={styles.growthNeutral}>→ 0%</Text>;
    }
    if (growth > 0) {
        return (
            <View style={styles.growthUp}>
                <Text style={styles.growthUpText}>↑ {growth.toFixed(1)}%</Text>
            </View>
        );
    }
    return (
        <View style={styles.growthDown}>
            <Text style={styles.growthDownText}>↓ {Math.abs(growth).toFixed(1)}%</Text>
        </View>
    );
}

export default function KPICard({ label, value, icon, iconBg, iconColor, growth }: KPICardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <Text style={styles.label} numberOfLines={2}>{label}</Text>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
            </View>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <GrowthBadge growth={growth} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 14,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        color: Colors.light.secondary,
        fontWeight: "600",
        flex: 1,
        marginRight: 6,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    value: {
        fontSize: 20,
        fontWeight: "800",
        color: Colors.light.text,
        marginBottom: 8,
    },
    growthUp: {
        alignSelf: "flex-start",
        backgroundColor: "#DCFCE7",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    growthUpText: { fontSize: 11, color: "#16a34a", fontWeight: "700" },
    growthDown: {
        alignSelf: "flex-start",
        backgroundColor: "#FEE2E2",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    growthDownText: { fontSize: 11, color: "#dc2626", fontWeight: "700" },
    growthNeutral: { fontSize: 11, color: Colors.light.secondary, fontWeight: "600" },
});
