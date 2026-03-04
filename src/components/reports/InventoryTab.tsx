import { Colors } from "@/constants/theme";
import RankedListRow from "@/src/components/reports/RankedListRow";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Props { data: IReportData }

function fmtCurrency(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
}

export default function InventoryTab({ data }: Props) {
    const { stockConsumption, recipePopularity } = data.inventory;
    const maxStock = Math.max(...stockConsumption.map((s) => s.consumed));
    const maxRecipe = Math.max(...recipePopularity.map((r) => r.revenue));

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Stock Consumption */}
            <Text style={styles.sectionTitle}>Stock Consumption</Text>
            <View style={styles.card}>
                {stockConsumption.map((s, i) => {
                    const pct = maxStock > 0 ? (s.consumed / maxStock) * 100 : 0;
                    return (
                        <View key={i} style={styles.horizRow}>
                            <Text style={styles.ingLabel} numberOfLines={1}>{s.ingredient}</Text>
                            <View style={styles.track}>
                                <View style={[styles.fill, { width: `${Math.max(pct, 1)}%` as any }]} />
                            </View>
                            <Text style={styles.ingVal}>{s.consumed} kg</Text>
                        </View>
                    );
                })}
            </View>

            {/* Recipe Popularity */}
            <Text style={styles.sectionTitle}>Recipe Popularity</Text>
            <View style={styles.card}>
                {recipePopularity.map((r, i) => {
                    const pct = maxRecipe > 0 ? (r.revenue / maxRecipe) * 100 : 0;
                    return (
                        <RankedListRow
                            key={i}
                            rank={i + 1}
                            label={r.recipe}
                            value={fmtCurrency(r.revenue)}
                            barPct={pct}
                            barColor="#8b5cf6"
                            valueColor="#16a34a"
                        />
                    );
                })}
            </View>
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.light.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 10,
    },
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    horizRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    ingLabel: { width: 90, fontSize: 12, color: Colors.light.secondary, fontWeight: "600" },
    track: { flex: 1, height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
    fill: { height: 8, borderRadius: 4, backgroundColor: "#3b82f6" },
    ingVal: { width: 60, fontSize: 12, color: Colors.light.text, fontWeight: "700", textAlign: "right" },
});
