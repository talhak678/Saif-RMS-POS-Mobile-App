import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CategoryRevenueProps {
    categoryRevenue: { name: string; revenue: number; quantity: number }[];
}

function fmt(n: number): string {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n}`;
}

export default function CategoryRevenue({ categoryRevenue }: CategoryRevenueProps) {
    if (!categoryRevenue || categoryRevenue.length === 0) return null;
    const max = Math.max(...categoryRevenue.map((c) => c.revenue));

    return (
        <View style={styles.card}>
            <Text style={styles.title}>📂 Revenue by Category</Text>
            {categoryRevenue.map((cat, idx) => {
                const pct = max > 0 ? (cat.revenue / max) * 100 : 0;
                return (
                    <View key={idx} style={styles.row}>
                        <Text style={styles.name} numberOfLines={1}>{cat.name}</Text>
                        <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%` }]} />
                        </View>
                        <Text style={styles.value}>{fmt(cat.revenue)}</Text>
                    </View>
                );
            })}
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
    title: { fontSize: 15, fontWeight: "700", color: Colors.light.text, marginBottom: 14 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    name: {
        width: 80,
        fontSize: 12,
        color: Colors.light.secondary,
        fontWeight: "600",
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 4,
        overflow: "hidden",
    },
    barFill: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#8b5cf6",
    },
    value: {
        width: 60,
        fontSize: 12,
        color: Colors.light.text,
        fontWeight: "700",
        textAlign: "right",
    },
});
