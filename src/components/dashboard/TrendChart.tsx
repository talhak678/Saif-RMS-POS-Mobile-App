import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32;

interface TrendChartProps {
    monthlySales: { month: string; revenue: number; orders: number }[];
}

type Mode = "revenue" | "orders";

export default function TrendChart({ monthlySales }: TrendChartProps) {
    const { colors, isDark } = useTheme();
    const [mode, setMode] = useState<Mode>("revenue");

    const bg = isDark ? colors.card : "#fff";

    if (!monthlySales || monthlySales.length === 0) {
        return (
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.secondary, textAlign: "center", padding: 20 }}>No trend data available</Text>
            </View>
        );
    }

    const labels = monthlySales.map((m) => m.month);
    const values = mode === "revenue"
        ? monthlySales.map((m) => m.revenue)
        : monthlySales.map((m) => m.orders);

    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.header}>
                <Text style={[s.title, { color: colors.text }]}>Monthly Trend</Text>
                <View style={[s.toggle, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                    {(["revenue", "orders"] as Mode[]).map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[s.toggleBtn, mode === m && s.toggleActive]}
                            onPress={() => setMode(m)}
                        >
                            <Text style={[s.toggleText, { color: mode === m ? "#fff" : colors.secondary }]}>
                                {m === "revenue" ? "Revenue" : "Orders"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <BarChart
                data={{ labels, datasets: [{ data: values }] }}
                width={screenWidth - 32}
                height={180}
                yAxisLabel={mode === "revenue" ? "$" : ""}
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: bg,
                    backgroundGradientFrom: bg,
                    backgroundGradientTo: bg,
                    decimalPlaces: 0,
                    color: (opacity = 1) => mode === "revenue"
                        ? `rgba(93,105,185,${opacity})`
                        : `rgba(16,185,129,${opacity})`,
                    labelColor: () => colors.secondary,
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

const s = StyleSheet.create({
    card: {
        borderRadius: 18, padding: 16, marginBottom: 16,
        borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    title: { fontSize: 15, fontWeight: "700" },
    toggle: { flexDirection: "row", borderRadius: 20, padding: 2 },
    toggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 18 },
    toggleActive: { backgroundColor: Colors.primary },
    toggleText: { fontSize: 12, fontWeight: "600" },
});
