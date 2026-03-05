import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReportStatCardProps { label: string; value: number; change: number; isCurrency?: boolean; }

function fmtVal(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString()}`;
}

export default function ReportStatCard({ label, value, change, isCurrency = true }: ReportStatCardProps) {
    const { colors, isDark } = useTheme();
    const isPos = change >= 0;
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.label, { color: colors.secondary }]} numberOfLines={2}>{label}</Text>
            <Text style={[s.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {isCurrency ? fmtVal(value) : value.toLocaleString()}
            </Text>
            <View style={[s.badge, { backgroundColor: isPos ? (isDark ? '#052e16' : '#DCFCE7') : (isDark ? '#3b0f0f' : '#FEE2E2') }]}>
                <Text style={[s.badgeText, { color: isPos ? "#16a34a" : "#dc2626" }]}>
                    {isPos ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 },
    value: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
    badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { fontSize: 11, fontWeight: "700" },
});
