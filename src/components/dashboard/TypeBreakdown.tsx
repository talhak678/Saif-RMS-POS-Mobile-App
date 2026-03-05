import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    DINE_IN: { label: "Dine-In", color: "#8b5cf6", bg: "#F5F3FF" },
    DELIVERY: { label: "Delivery", color: "#f97316", bg: "#FFF7ED" },
    PICKUP: { label: "Pickup", color: "#0891b2", bg: "#ECFEFF" },
};

export default function TypeBreakdown({ typeBreakdown }: { typeBreakdown: Record<string, number> }) {
    const { colors, isDark } = useTheme();
    const entries = Object.entries(typeBreakdown);
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.text }]}>Order Types</Text>
            <View style={s.row}>
                {entries.map(([key, count]) => {
                    const cfg = TYPE_CONFIG[key] || { label: key, color: "#9CA3AF", bg: "#F9FAFB" };
                    return (
                        <View key={key} style={[s.item, { backgroundColor: isDark ? cfg.color + "20" : cfg.bg }]}>
                            <Text style={[s.count, { color: cfg.color }]}>{count}</Text>
                            <Text style={[s.label, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    title: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
    row: { flexDirection: "row", gap: 10 },
    item: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    count: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    label: { fontSize: 12, fontWeight: "600" },
});
