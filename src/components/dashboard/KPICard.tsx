import { useTheme } from "@/src/context/ThemeContext";
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

function GrowthBadge({ growth, isDark }: { growth?: number | null; isDark: boolean }) {
    if (growth === undefined || growth === null)
        return <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>—</Text>;
    if (growth === 0)
        return <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>→ 0%</Text>;
    if (growth > 0)
        return (
            <View style={[s.badge, { backgroundColor: isDark ? "#052e16" : "#DCFCE7" }]}>
                <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "700" }}>↑ {Number(growth.toFixed(2))}%</Text>
            </View>
        );
    return (
        <View style={[s.badge, { backgroundColor: isDark ? "#3b1212" : "#FEE2E2" }]}>
            <Text style={{ fontSize: 11, color: "#dc2626", fontWeight: "700" }}>↓ {Number(Math.abs(growth).toFixed(2))}%</Text>
        </View>
    );
}

export default function KPICard({ label, value, icon, iconBg, iconColor, growth }: KPICardProps) {
    const { colors, isDark } = useTheme();
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.topRow}>
                <Text style={[s.label, { color: colors.secondary }]} numberOfLines={2}>{label}</Text>
                <View style={[s.iconCircle, { backgroundColor: isDark ? iconColor + "22" : iconBg }]}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
            </View>
            <Text style={[s.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <GrowthBadge growth={growth} isDark={isDark} />
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        borderRadius: 16, padding: 14, flex: 1,
        borderWidth: 1, shadowColor: "#000",
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    label: { fontSize: 12, fontWeight: "600", flex: 1, marginRight: 6, textTransform: "uppercase", letterSpacing: 0.4 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    value: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
    badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
});
