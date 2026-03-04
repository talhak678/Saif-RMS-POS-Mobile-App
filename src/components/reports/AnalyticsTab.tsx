import { Colors } from "@/constants/theme";
import ReportStatCard from "@/src/components/reports/ReportStatCard";
import { IReportData, TimeRange } from "@/types/reports.types";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

const TIME_TOGGLES: { label: string; value: TimeRange }[] = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
];

const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => Colors.primary,
    labelColor: () => Colors.light.secondary,
    barPercentage: 0.6,
    propsForLabels: { fontSize: 10 },
};

interface AnalyticsTabProps {
    data: IReportData;
}

export default function AnalyticsTab({ data }: AnalyticsTabProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("daily");
    const trendData = data.salesTrend[timeRange];

    const barData = {
        labels: trendData.map((d) => d.date.slice(-5)),
        datasets: [{ data: trendData.map((d) => d.sales) }],
    };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Summary Cards */}
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.cardRow}>
                <ReportStatCard label="Payments" value={data.summary.payments.total} change={data.summary.payments.change} />
                <ReportStatCard label="Revenue" value={data.summary.revenue.total} change={data.summary.revenue.change} />
                <ReportStatCard label="Tips" value={data.summary.tips.total} change={data.summary.tips.change} />
            </View>

            {/* Time toggle */}
            <Text style={styles.sectionTitle}>Sales Trend</Text>
            <View style={styles.toggle}>
                {TIME_TOGGLES.map((t) => (
                    <TouchableOpacity
                        key={t.value}
                        style={[styles.toggleBtn, timeRange === t.value && styles.toggleActive]}
                        onPress={() => setTimeRange(t.value)}
                    >
                        <Text style={[styles.toggleText, timeRange === t.value && styles.toggleTextActive]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bar Chart */}
            <View style={styles.chartCard}>
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
                    <Text style={styles.noData}>No trend data available</Text>
                )}
            </View>

            {/* Orders line */}
            <View style={styles.chartCard}>
                <Text style={styles.subTitle}>Orders Count</Text>
                {trendData.map((d, i) => {
                    const max = Math.max(...trendData.map((x) => x.orders));
                    const pct = max > 0 ? (d.orders / max) * 100 : 0;
                    return (
                        <View key={i} style={styles.row}>
                            <Text style={styles.rowLabel} numberOfLines={1}>{d.date}</Text>
                            <View style={styles.track}>
                                <View style={[styles.fill, { width: `${Math.max(pct, 1)}%` as any }]} />
                            </View>
                            <Text style={styles.rowVal}>{d.orders}</Text>
                        </View>
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
    cardRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
    toggle: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 10,
        padding: 3,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
    toggleActive: { backgroundColor: Colors.primary },
    toggleText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
    toggleTextActive: { color: "#fff", fontWeight: "700" },
    chartCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    noData: { textAlign: "center", color: Colors.light.secondary, paddingVertical: 20 },
    subTitle: { fontSize: 13, fontWeight: "700", color: Colors.light.text, marginBottom: 12 },
    row: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
    rowLabel: { width: 64, fontSize: 11, color: Colors.light.secondary, fontWeight: "600" },
    track: { flex: 1, height: 7, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
    fill: { height: 7, borderRadius: 4, backgroundColor: "#10b981" },
    rowVal: { width: 32, fontSize: 12, color: Colors.light.text, fontWeight: "700", textAlign: "right" },
});
