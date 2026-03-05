import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b", CONFIRMED: "#5d69b9", PREPARING: "#8b5cf6",
    KITCHEN_READY: "#06b6d4", OUT_FOR_DELIVERY: "#f97316",
    DELIVERED: "#10b981", CANCELLED: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending", CONFIRMED: "Confirmed", PREPARING: "Preparing",
    KITCHEN_READY: "Kitchen Ready", OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

interface Props { statusBreakdown: Record<string, number>; totalOrders: number; }

export default function StatusBreakdown({ statusBreakdown, totalOrders }: Props) {
    const { colors, isDark } = useTheme();
    const entries = Object.entries(statusBreakdown).sort(([, a], [, b]) => b - a);

    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.text }]}>Order Status Breakdown</Text>
            {entries.map(([status, count]) => {
                const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                const color = STATUS_COLORS[status] || Colors.primary;
                return (
                    <View key={status} style={s.row}>
                        <Text style={[s.statusLabel, { color: colors.secondary }]} numberOfLines={1}>
                            {STATUS_LABELS[status] || status}
                        </Text>
                        <View style={[s.barTrack, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                            <View style={[s.barFill, { width: `${Math.max(pct, 1)}%`, backgroundColor: color }]} />
                        </View>
                        <Text style={[s.count, { color: colors.text }]}>{count}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    title: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    statusLabel: { width: 100, fontSize: 12, fontWeight: "600" },
    barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
    barFill: { height: 8, borderRadius: 4 },
    count: { width: 32, fontSize: 12, fontWeight: "700", textAlign: "right" },
});
