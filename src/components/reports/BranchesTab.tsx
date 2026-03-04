import { Colors } from "@/constants/theme";
import { IReportData } from "@/types/reports.types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

interface Props { data: IReportData }

function fmtK(n: number) {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
}

export default function BranchesTab({ data }: Props) {
    const { salesPerBranch } = data.branches;

    const salesBar = {
        labels: salesPerBranch.map((b) => b.branch.split(" ")[0]),
        datasets: [{ data: salesPerBranch.map((b) => b.sales) }],
    };

    const ordersBar = {
        labels: salesPerBranch.map((b) => b.branch.split(" ")[0]),
        datasets: [{ data: salesPerBranch.map((b) => b.orders) }],
    };

    const salescfg = {
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: () => "#3b82f6",
        labelColor: () => Colors.light.secondary,
        barPercentage: 0.6,
        propsForLabels: { fontSize: 10 },
    };

    const orderscfg = { ...salescfg, color: () => "#7f8c9e" };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Branch Sales ($)</Text>
            <View style={styles.card}>
                {salesPerBranch.length > 0 ? (
                    <BarChart
                        data={salesBar}
                        width={W - 8}
                        height={200}
                        yAxisLabel="$"
                        yAxisSuffix=""
                        chartConfig={salescfg}
                        style={{ borderRadius: 12 }}
                        fromZero
                        withInnerLines={false}
                    />
                ) : (
                    <Text style={styles.noData}>No branch data</Text>
                )}
            </View>

            <Text style={styles.sectionTitle}>Branch Orders</Text>
            <View style={styles.card}>
                {salesPerBranch.length > 0 ? (
                    <BarChart
                        data={ordersBar}
                        width={W - 8}
                        height={180}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={orderscfg}
                        style={{ borderRadius: 12 }}
                        fromZero
                        withInnerLines={false}
                    />
                ) : (
                    <Text style={styles.noData}>No branch data</Text>
                )}
            </View>

            {/* Branch table */}
            <View style={styles.card}>
                <Text style={styles.tableTitle}>Branch Summary</Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, { flex: 2 }]}>Branch</Text>
                    <Text style={styles.cell}>Sales</Text>
                    <Text style={styles.cell}>Orders</Text>
                </View>
                {salesPerBranch.map((b, i) => (
                    <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                        <Text style={[styles.cellData, { flex: 2 }]} numberOfLines={1}>{b.branch}</Text>
                        <Text style={[styles.cellData, { color: "#3b82f6" }]}>{fmtK(b.sales)}</Text>
                        <Text style={[styles.cellData, { color: "#7f8c9e" }]}>{b.orders}</Text>
                    </View>
                ))}
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
    noData: { textAlign: "center", color: Colors.light.secondary, paddingVertical: 20 },
    tableTitle: { fontSize: 13, fontWeight: "700", color: Colors.light.text, marginBottom: 10 },
    tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderColor: Colors.light.border, paddingBottom: 6, marginBottom: 4 },
    tableRow: { flexDirection: "row", paddingVertical: 8, borderRadius: 6 },
    tableRowAlt: { backgroundColor: "#FAFBFF" },
    cell: { flex: 1, fontSize: 11, fontWeight: "700", color: Colors.light.secondary, textTransform: "uppercase", letterSpacing: 0.3 },
    cellData: { flex: 1, fontSize: 13, fontWeight: "600", color: Colors.light.text },
});
