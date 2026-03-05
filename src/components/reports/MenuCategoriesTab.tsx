import { Colors } from "@/constants/theme";
import RankedListRow from "@/src/components/reports/RankedListRow";
import { useTheme } from "@/src/context/ThemeContext";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

function fmtCurrency(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
}

export default function MenuCategoriesTab({ data }: { data: IReportData }) {
    const { colors } = useTheme();
    const { salesByCategory, topSellingItems } = data.menuCategories;
    const maxSales = Math.max(...topSellingItems.map((t) => t.sales));

    const pieData = salesByCategory.map((c) => ({
        name: c.category,
        population: c.value,
        color: c.color,
        legendFontColor: colors.secondary,
        legendFontSize: 12,
    }));

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Revenue by Category</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {pieData.length > 0 ? (
                    <PieChart
                        data={pieData}
                        width={W - 8}
                        height={180}
                        chartConfig={{ color: () => "#000" }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="10"
                        hasLegend
                    />
                ) : (
                    <Text style={[s.noData, { color: colors.secondary }]}>No data</Text>
                )}
                <View style={s.catSummary}>
                    {salesByCategory.map((c, i) => (
                        <View key={i} style={s.catRow}>
                            <View style={[s.catDot, { backgroundColor: c.color }]} />
                            <Text style={[s.catName, { color: colors.text }]} numberOfLines={1}>{c.category}</Text>
                            <Text style={[s.catVal, { color: c.color }]}>{fmtCurrency(c.value)}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Top Selling Items</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {topSellingItems.map((item, i) => {
                    const pct = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                    return (
                        <RankedListRow key={i} rank={i + 1} label={item.item}
                            value={fmtCurrency(item.sales)} barPct={pct}
                            barColor={Colors.primary} valueColor="#16a34a" />
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
    noData: { textAlign: "center", paddingVertical: 20 },
    catSummary: { marginTop: 10, gap: 6 },
    catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    catDot: { width: 10, height: 10, borderRadius: 5 },
    catName: { flex: 1, fontSize: 13, fontWeight: "600" },
    catVal: { fontSize: 13, fontWeight: "700" },
});
