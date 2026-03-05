import { Colors } from "@/constants/theme";
import ReportStatCard from "@/src/components/reports/ReportStatCard";
import { useTheme } from "@/src/context/ThemeContext";
import { IReportData, TimeRange } from "@/types/reports.types";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

const TIME_TOGGLES: { label: string; value: TimeRange }[] = [
    // { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
];

export default function AnalyticsTab({ data }: { data: IReportData }) {
    const { colors, isDark } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
    const trendData = data.salesTrend[timeRange];


    // For monthly: just show first letter (J, F, M…). For others: last 5 chars (MM-DD)
    const barLabels = trendData.map((d) => {
        if (timeRange === "monthly") return d.date.slice(0, 1); // e.g. "J"
        return d.date.slice(-5); // "MM-DD"
    });

    const barData = {
        labels: barLabels,
        datasets: [{ data: trendData.map((d) => d.sales) }],
    };

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: () => Colors.primary,
        labelColor: () => colors.secondary,
        barPercentage: timeRange === "monthly" ? 0.5 : 0.6,
        propsForLabels: { fontSize: 10 },
    };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Summary Cards */}
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Summary</Text>
            <View style={s.cardRow}>
                <ReportStatCard label="Payments" value={data.summary.payments.total} change={data.summary.payments.change} />
                <ReportStatCard label="Revenue" value={data.summary.revenue.total} change={data.summary.revenue.change} />
                <ReportStatCard label="Tips" value={data.summary.tips.total} change={data.summary.tips.change} />
            </View>

            {/* Time Toggle */}
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>Sales Trend</Text>
            <View style={[s.toggle, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                {TIME_TOGGLES.map((t) => (
                    <TouchableOpacity
                        key={t.value}
                        style={[s.toggleBtn, timeRange === t.value && s.toggleActive]}
                        onPress={() => setTimeRange(t.value)}
                    >
                        <Text style={[s.toggleText, { color: colors.secondary }, timeRange === t.value && s.toggleTextActive]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bar Chart */}
            <View style={[s.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {trendData.length > 0 ? (
                    <BarChart
                        data={barData}
                        width={W - 8}
                        height={200}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        style={{ borderRadius: 12 }}
                        showValuesOnTopOfBars={false}
                        fromZero
                        withInnerLines={false}
                    />
                ) : (
                    <Text style={[s.noData, { color: colors.secondary }]}>No trend data available</Text>
                )}
            </View>

            {/* Orders Count bars */}
            <View style={[s.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[s.subTitle, { color: colors.text }]}>Orders Count</Text>
                {trendData.map((d, i) => {
                    const max = Math.max(...trendData.map((x) => x.orders));
                    const pct = max > 0 ? (d.orders / max) * 100 : 0;
                    return (
                        <View key={i} style={s.row}>
                            <Text style={[s.rowLabel, { color: colors.secondary }]} numberOfLines={1}>{d.date}</Text>
                            <View style={[s.track, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                                <View style={[s.fill, { width: `${Math.max(pct, 1)}%` as any }]} />
                            </View>
                            <Text style={[s.rowVal, { color: colors.text }]}>{d.orders}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={{ height: 120 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
    cardRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    toggle: { flexDirection: "row", borderRadius: 10, padding: 3, marginBottom: 12, alignSelf: "flex-start" },
    toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    toggleActive: { backgroundColor: Colors.primary },
    toggleText: { fontSize: 12, fontWeight: "600" },
    toggleTextActive: { color: "#fff", fontWeight: "700" },
    chartCard: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    noData: { textAlign: "center", paddingVertical: 20 },
    subTitle: { fontSize: 13, fontWeight: "700", marginBottom: 12 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
    rowLabel: { width: 64, fontSize: 11, fontWeight: "600" },
    track: { flex: 1, height: 7, borderRadius: 4, overflow: "hidden" },
    fill: { height: 7, borderRadius: 4, backgroundColor: "#10b981" },
    rowVal: { width: 32, fontSize: 12, fontWeight: "700", textAlign: "right" },
});
