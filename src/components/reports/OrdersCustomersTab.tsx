import { useTheme } from "@/src/context/ThemeContext";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

export default function OrdersCustomersTab({ data }: { data: IReportData }) {
    const { colors, isDark } = useTheme();
    const { orderSource, customerLocations } = data.ordersCustomers;

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: () => "#6366f1",
        labelColor: () => colors.secondary,
        barPercentage: 0.55,
        propsForLabels: { fontSize: 10 },
    };

    const pieData = orderSource.map((s) => ({
        name: s.name,
        population: s.value,
        color: s.color,
        legendFontColor: colors.secondary,
        legendFontSize: 12,
    }));

    const locBar = {
        labels: customerLocations.map((l) => l.area.slice(0, 4)),
        datasets: [{ data: customerLocations.map((l) => l.orders) }],
    };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Order Source</Text>
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
                <View style={s.legend}>
                    {orderSource.map((src, i) => (
                        <View key={i} style={s.legendRow}>
                            <View style={[s.dot, { backgroundColor: src.color }]} />
                            <Text style={[s.legendName, { color: colors.text }]}>{src.name}</Text>
                            <Text style={[s.legendVal, { color: colors.secondary }]}>{src.value} orders</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Customer Locations</Text>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {customerLocations.length > 0 ? (
                    <BarChart
                        data={locBar}
                        width={W - 8}
                        height={180}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        style={{ borderRadius: 12 }}
                        fromZero
                        withInnerLines={false}
                    />
                ) : (
                    <Text style={[s.noData, { color: colors.secondary }]}>No data</Text>
                )}
            </View>
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
    card: { borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    noData: { textAlign: "center", paddingVertical: 20 },
    legend: { marginTop: 10, gap: 6 },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendName: { flex: 1, fontSize: 13, fontWeight: "600" },
    legendVal: { fontSize: 13 },
});
