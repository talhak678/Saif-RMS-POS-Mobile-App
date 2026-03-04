import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RankedListRowProps {
    rank: number;
    label: string;
    value: string;
    barPct?: number; // 0-100, if provided shows a bar
    barColor?: string;
    valueColor?: string;
}

export default function RankedListRow({
    rank,
    label,
    value,
    barPct,
    barColor = Colors.primary,
    valueColor = "#16a34a",
}: RankedListRowProps) {
    return (
        <View style={styles.row}>
            <View style={styles.rank}>
                <Text style={styles.rankText}>{rank}</Text>
            </View>
            <View style={styles.body}>
                <View style={styles.topLine}>
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                    <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
                </View>
                {barPct !== undefined && (
                    <View style={styles.track}>
                        <View style={[styles.fill, { width: `${Math.max(barPct, 1)}%` as any, backgroundColor: barColor }]} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 4,
        gap: 10,
    },
    rank: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.primary + "18",
        alignItems: "center",
        justifyContent: "center",
    },
    rankText: { fontSize: 12, fontWeight: "800", color: Colors.primary },
    body: { flex: 1, gap: 5 },
    topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { fontSize: 13, fontWeight: "600", color: Colors.light.text, flex: 1, marginRight: 8 },
    value: { fontSize: 13, fontWeight: "700" },
    track: { height: 5, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden" },
    fill: { height: 5, borderRadius: 3 },
});
