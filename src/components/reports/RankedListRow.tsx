import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RankedListRowProps {
    rank: number;
    label: string;
    value: string;
    barPct?: number;
    barColor?: string;
    valueColor?: string;
}

export default function RankedListRow({ rank, label, value, barPct, barColor = Colors.primary, valueColor = "#16a34a" }: RankedListRowProps) {
    const { colors, isDark } = useTheme();
    return (
        <View style={s.row}>
            <View style={[s.rank, { backgroundColor: Colors.primary + "18" }]}>
                <Text style={s.rankText}>{rank}</Text>
            </View>
            <View style={s.body}>
                <View style={s.topLine}>
                    <Text style={[s.label, { color: colors.text }]} numberOfLines={1}>{label}</Text>
                    <Text style={[s.value, { color: valueColor }]}>{value}</Text>
                </View>
                {barPct !== undefined && (
                    <View style={[s.track, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                        <View style={[s.fill, { width: `${Math.max(barPct, 1)}%` as any, backgroundColor: barColor }]} />
                    </View>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, gap: 10 },
    rank: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    rankText: { fontSize: 12, fontWeight: "800", color: Colors.primary },
    body: { flex: 1, gap: 5 },
    topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { fontSize: 13, fontWeight: "600", flex: 1, marginRight: 8 },
    value: { fontSize: 13, fontWeight: "700" },
    track: { height: 5, borderRadius: 3, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
});
