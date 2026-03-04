import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReportStatCardProps {
    label: string;
    value: number;
    change: number;
    isCurrency?: boolean;
}

function fmtVal(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString()}`;
}

export default function ReportStatCard({ label, value, change, isCurrency = true }: ReportStatCardProps) {
    const isPos = change >= 0;
    return (
        <View style={styles.card}>
            <Text style={styles.label} numberOfLines={2}>{label}</Text>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {isCurrency ? fmtVal(value) : value.toLocaleString()}
            </Text>
            <View style={[styles.badge, isPos ? styles.badgeUp : styles.badgeDown]}>
                <Text style={[styles.badgeText, { color: isPos ? "#16a34a" : "#dc2626" }]}>
                    {isPos ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.light.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 8,
    },
    value: {
        fontSize: 18,
        fontWeight: "800",
        color: Colors.light.text,
        marginBottom: 8,
    },
    badge: {
        alignSelf: "flex-start",
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    badgeUp: { backgroundColor: "#DCFCE7" },
    badgeDown: { backgroundColor: "#FEE2E2" },
    badgeText: { fontSize: 11, fontWeight: "700" },
});
