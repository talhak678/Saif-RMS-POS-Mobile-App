import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SegmentCardProps {
    label: string;
    desc: string;
    count: number;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    isActive: boolean;
    onPress: () => void;
}

export default function SegmentCard({ label, desc, count, accentColor, badgeBg, badgeText, isActive, onPress }: SegmentCardProps) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                s.card,
                { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: accentColor },
                isActive && { borderColor: Colors.primary, borderWidth: 2, borderLeftWidth: 4 },
            ]}
        >
            <View style={s.topRow}>
                <Text style={[s.label, { color: colors.text }]} numberOfLines={1}>{label}</Text>
                <View style={[s.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[s.badgeText, { color: badgeText }]}>{count}</Text>
                </View>
            </View>
            <Text style={[s.desc, { color: colors.secondary }]}>{desc}</Text>
            <Text style={[s.action, { color: isActive ? "#dc2626" : Colors.primary }]}>
                {isActive ? "✕ Clear Filter" : "View Customers →"}
            </Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    card: { flex: 1, borderRadius: 12, borderLeftWidth: 4, padding: 12, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: 4 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { fontSize: 12, fontWeight: "700", flex: 1, marginRight: 6 },
    badge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, minWidth: 24, alignItems: "center" },
    badgeText: { fontSize: 11, fontWeight: "700" },
    desc: { fontSize: 10, lineHeight: 14 },
    action: { fontSize: 11, fontWeight: "700", marginTop: 2 },
});
