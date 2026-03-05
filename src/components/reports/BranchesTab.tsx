import { useTheme } from "@/src/context/ThemeContext";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

function fmtK(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
}

export default function BranchesTab({ data }: { data: IReportData }) {
    const { colors, isDark } = useTheme();
    const { salesPerBranch } = data.branches;

    const mkConfig = (barColor: string) => ({
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: () => barColor,
        labelColor: () => colors.secondary,
        barPercentage: 0.6,
        propsForLabels: { fontSize: 10 },
    });

    const labels = salesPerBranch.map((b) => b.branch.split(" ")[0]);
    const salesBar = { labels, datasets: [{ data: salesPerBranch.map((b) => b.sales) }] };
    const ordersBar = { labels, datasets: [{ data: salesPerBranch.map((b) => b.orders) }] };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Branch Sales ($)</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {salesPerBranch.length > 0 ? (
                    <BarChart data={salesBar} width={W - 8} height={200} yAxisLabel="$" yAxisSuffix=""
                        chartConfig={mkConfig("#3b82f6")} style={{ borderRadius: 12 }} fromZero withInnerLines={false} />
                ) : (
                    <Text style={[s.noData, { color: colors.secondary }]}>No branch data</Text>
                )}
            </View>

            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Branch Orders</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {salesPerBranch.length > 0 ? (
                    <BarChart data={ordersBar} width={W - 8} height={180} yAxisLabel="" yAxisSuffix=""
                        chartConfig={mkConfig("#7f8c9e")} style={{ borderRadius: 12 }} fromZero withInnerLines={false} />
                ) : (
                    <Text style={[s.noData, { color: colors.secondary }]}>No branch data</Text>
                )}
            </View>

            {/* Branch Summary Table */}
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[s.tableTitle, { color: colors.text }]}>Branch Summary</Text>
                <View style={[s.tableHeader, { borderColor: colors.border }]}>
                    <Text style={[s.cell, { flex: 2, color: colors.secondary }]}>Branch</Text>
                    <Text style={[s.cell, { color: colors.secondary }]}>Sales</Text>
                    <Text style={[s.cell, { color: colors.secondary }]}>Orders</Text>
                </View>
                {salesPerBranch.map((b, i) => (
                    <View key={i} style={[s.tableRow, i % 2 === 0 && { backgroundColor: isDark ? colors.border + "40" : "#FAFBFF" }]}>
                        <Text style={[s.cellData, { flex: 2, color: colors.text }]} numberOfLines={1}>{b.branch}</Text>
                        <Text style={[s.cellData, { color: "#3b82f6" }]}>{fmtK(b.sales)}</Text>
                        <Text style={[s.cellData, { color: "#7f8c9e" }]}>{b.orders}</Text>
                    </View>
                ))}
            </View>
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
    card: { borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    noData: { textAlign: "center", paddingVertical: 20 },
    tableTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
    tableHeader: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 6, marginBottom: 4 },
    tableRow: { flexDirection: "row", paddingVertical: 8, borderRadius: 6 },
    cell: { flex: 1, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
    cellData: { flex: 1, fontSize: 13, fontWeight: "600" },
});
