import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    POS: { label: "POS", color: "#f97316", bg: "#FFF7ED" },
    WEBSITE: { label: "Website", color: Colors.primary, bg: "#EEF0FB" },
    MOBILE: { label: "Mobile", color: "#0d9488", bg: "#F0FDFA" },
};

interface SourceBreakdownProps {
    sourceBreakdown: Record<string, number>;
}

export default function SourceBreakdown({ sourceBreakdown }: SourceBreakdownProps) {
    const entries = Object.entries(sourceBreakdown);
    return (
        <View style={styles.card}>
            <Text style={styles.title}>📡 Orders by Platform</Text>
            <View style={styles.row}>
                {entries.map(([key, count]) => {
                    const cfg = SOURCE_CONFIG[key] || { label: key, color: "#9CA3AF", bg: "#F9FAFB" };
                    return (
                        <View key={key} style={[styles.item, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.itemCount, { color: cfg.color }]}>{count}</Text>
                            <Text style={[styles.itemLabel, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    );
                })}
            </View>
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
    row: { flexDirection: "row", gap: 10 },
    item: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
    },
    itemCount: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    itemLabel: { fontSize: 12, fontWeight: "600" },
});
