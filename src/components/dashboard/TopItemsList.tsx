import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TopItemsListProps {
    topItems: { name: string; quantity: number }[];
}

export default function TopItemsList({ topItems }: TopItemsListProps) {
    if (!topItems || topItems.length === 0) return null;
    const max = Math.max(...topItems.map((i) => i.quantity));

    return (
        <View style={styles.card}>
            <Text style={styles.title}>🏆 Top Items</Text>
            {topItems.map((item, idx) => {
                const pct = max > 0 ? (item.quantity / max) * 100 : 0;
                return (
                    <View key={idx} style={styles.row}>
                        <View style={styles.rank}>
                            <Text style={styles.rankText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%` }]} />
                        </View>
                        <Text style={styles.qty}>{item.quantity}</Text>
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
    rank: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: Colors.primary + "20",
        alignItems: "center",
        justifyContent: "center",
    },
    rankText: { fontSize: 11, fontWeight: "800", color: Colors.primary },
    name: {
        width: 110,
        fontSize: 12,
        color: Colors.light.text,
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
        backgroundColor: Colors.primary,
    },
    qty: {
        width: 32,
        fontSize: 12,
        color: Colors.light.secondary,
        fontWeight: "700",
        textAlign: "right",
    },
});
