import RankedListRow from "@/src/components/reports/RankedListRow";
import { useTheme } from "@/src/context/ThemeContext";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function fmtCurrency(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
}

export default function InventoryTab({ data }: { data: IReportData }) {
    const { colors, isDark } = useTheme();
    const { stockConsumption, recipePopularity } = data.inventory;
    const maxStock = Math.max(...stockConsumption.map((s) => s.consumed));
    const maxRecipe = Math.max(...recipePopularity.map((r) => r.revenue));

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Stock Consumption</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {stockConsumption.map((item, i) => {
                    const pct = maxStock > 0 ? (item.consumed / maxStock) * 100 : 0;
                    return (
                        <View key={i} style={s.horizRow}>
                            <Text style={[s.ingLabel, { color: colors.secondary }]} numberOfLines={1}>{item.ingredient}</Text>
                            <View style={[s.track, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                                <View style={[s.fill, { width: `${Math.max(pct, 1)}%` as any }]} />
                            </View>
                            <Text style={[s.ingVal, { color: colors.text }]}>{item.consumed} kg</Text>
                        </View>
                    );
                })}
            </View>

            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Recipe Popularity</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {recipePopularity.map((r, i) => {
                    const pct = maxRecipe > 0 ? (r.revenue / maxRecipe) * 100 : 0;
                    return (
                        <RankedListRow key={i} rank={i + 1} label={r.recipe}
                            value={fmtCurrency(r.revenue)} barPct={pct}
                            barColor="#8b5cf6" valueColor="#16a34a" />
                    );
                })}
            </View>
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
    card: { borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    horizRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
    ingLabel: { width: 90, fontSize: 12, fontWeight: "600" },
    track: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
    fill: { height: 8, borderRadius: 4, backgroundColor: "#3b82f6" },
    ingVal: { width: 60, fontSize: 12, fontWeight: "700", textAlign: "right" },
});
