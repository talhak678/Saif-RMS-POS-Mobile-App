import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props { topItems: { name: string; quantity: number }[]; }

export default function TopItemsList({ topItems }: Props) {
    const { colors, isDark } = useTheme();
    if (!topItems || topItems.length === 0) return null;
    const max = Math.max(...topItems.map((i) => i.quantity));

    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.text }]}>Top Items</Text>
            {topItems.map((item, idx) => {
                const pct = max > 0 ? (item.quantity / max) * 100 : 0;
                return (
                    <View key={idx} style={s.row}>
                        <View style={s.rank}>
                            <Text style={s.rankText}>{idx + 1}</Text>
                        </View>
                        <Text style={[s.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                        <View style={[s.barTrack, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                            <View style={[s.barFill, { width: `${Math.max(pct, 2)}%` }]} />
                        </View>
                        <Text style={[s.qty, { color: colors.secondary }]}>{item.quantity}</Text>
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
    rank: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center" },
    rankText: { fontSize: 11, fontWeight: "800", color: Colors.primary },
    name: { width: 110, fontSize: 12, fontWeight: "600" },
    barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
    barFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    qty: { width: 32, fontSize: 12, fontWeight: "700", textAlign: "right" },
});
