import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    DINE_IN: { label: "Dine-In", color: "#8b5cf6", bg: "#F5F3FF" },
    DELIVERY: { label: "Delivery", color: "#f97316", bg: "#FFF7ED" },
    PICKUP: { label: "Pickup", color: "#0891b2", bg: "#ECFEFF" },
};

interface TypeBreakdownProps {
    typeBreakdown: Record<string, number>;
}

export default function TypeBreakdown({ typeBreakdown }: TypeBreakdownProps) {
    const entries = Object.entries(typeBreakdown);
    return (
        <View style={styles.card}>
            <Text style={styles.title}>🍽️ Order Types</Text>
            <View style={styles.row}>
                {entries.map(([key, count]) => {
                    const cfg = TYPE_CONFIG[key] || { label: key, color: "#9CA3AF", bg: "#F9FAFB" };
                    return (
                        <View key={key} style={[styles.item, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.itemCount, { color: cfg.color }]}>{count}</Text>
                            <Text style={[styles.itemLabel, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    title: { fontSize: 15, fontWeight: "700", color: Colors.light.text, marginBottom: 14 },
    row: { flexDirection: "row", gap: 10 },
    item: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
    },
    itemCount: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    itemLabel: { fontSize: 12, fontWeight: "600" },
});
