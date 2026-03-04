import { Colors } from "@/constants/theme";
import React, { useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32;

interface TrendChartProps {
    monthlySales: { month: string; revenue: number; orders: number }[];
}

type Mode = "revenue" | "orders";

export default function TrendChart({ monthlySales }: TrendChartProps) {
    const [mode, setMode] = useState<Mode>("revenue");

    if (!monthlySales || monthlySales.length === 0) {
        return (
            <View style={[styles.card, styles.empty]}>
                <Text style={styles.emptyText}>No trend data available</Text>
            </View>
        );
    }

    const labels = monthlySales.map((m) => m.month);
    const values =
        mode === "revenue"
            ? monthlySales.map((m) => m.revenue)
            : monthlySales.map((m) => m.orders);

    const chartData = {
        labels,
        datasets: [{ data: values }],
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>📈 Monthly Trend</Text>
                <View style={styles.toggle}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === "revenue" && styles.toggleActive]}
                        onPress={() => setMode("revenue")}
                    >
                        <Text style={[styles.toggleText, mode === "revenue" && styles.toggleTextActive]}>
                            Revenue
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, mode === "orders" && styles.toggleActive]}
                        onPress={() => setMode("orders")}
                    >
                        <Text style={[styles.toggleText, mode === "orders" && styles.toggleTextActive]}>
                            Orders
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <BarChart
                data={chartData}
                width={screenWidth - 32}
                height={180}
                yAxisLabel={mode === "revenue" ? "$" : ""}
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                        mode === "revenue"
                            ? `rgba(93,105,185,${opacity})`
                            : `rgba(16,185,129,${opacity})`,
                    labelColor: () => Colors.light.secondary,
                    barPercentage: 0.65,
                    propsForLabels: { fontSize: 11 },
                }}
                style={{ borderRadius: 12, marginTop: 8 }}
                showValuesOnTopOfBars={false}
                fromZero
                withInnerLines={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    title: { fontSize: 15, fontWeight: "700", color: Colors.light.text },
    toggle: {
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        padding: 2,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 18,
    },
    toggleActive: { backgroundColor: Colors.primary },
    toggleText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
    toggleTextActive: { color: "#fff", fontWeight: "700" },
    empty: { alignItems: "center", justifyContent: "center", height: 80 },
    emptyText: { color: Colors.light.secondary, fontSize: 14 },
});
