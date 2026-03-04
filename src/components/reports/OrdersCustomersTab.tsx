import { Colors } from "@/constants/theme";
import { IReportData } from "@/types/reports.types";
import React from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const W = Dimensions.get("window").width - 48;

const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => "#6366f1",
    labelColor: () => Colors.light.secondary,
    barPercentage: 0.55,
    propsForLabels: { fontSize: 10 },
};

interface Props { data: IReportData }

export default function OrdersCustomersTab({ data }: Props) {
    const { orderSource, customerLocations } = data.ordersCustomers;

    const pieData = orderSource.map((s) => ({
        name: s.name,
        population: s.value,
        color: s.color,
        legendFontColor: Colors.light.secondary,
        legendFontSize: 12,
    }));

    const locBar = {
        labels: customerLocations.map((l) => l.area),
        datasets: [{ data: customerLocations.map((l) => l.orders) }],
    };

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Order Source Donut */}
            <Text style={styles.sectionTitle}>Order Source</Text>
            <View style={styles.card}>
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
                    <Text style={styles.noData}>No data</Text>
                )}
                {/* Value labels */}
                <View style={styles.legend}>
                    {orderSource.map((s, i) => (
                        <View key={i} style={styles.legendRow}>
                            <View style={[styles.dot, { backgroundColor: s.color }]} />
                            <Text style={styles.legendName}>{s.name}</Text>
                            <Text style={styles.legendVal}>{s.value} orders</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Customer Locations */}
            <Text style={styles.sectionTitle}>Customer Locations</Text>
            <View style={styles.card}>
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
                    <Text style={styles.noData}>No data</Text>
                )}
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
    legend: { marginTop: 10, gap: 6 },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendName: { flex: 1, fontSize: 13, color: Colors.light.text, fontWeight: "600" },
    legendVal: { fontSize: 13, color: Colors.light.secondary },
});
