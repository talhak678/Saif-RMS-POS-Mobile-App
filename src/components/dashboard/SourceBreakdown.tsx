import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    POS: { label: "POS", color: "#f97316", bg: "#FFF7ED" },
    WEBSITE: { label: "Website", color: Colors.primary, bg: "#EEF0FB" },
    MOBILE: { label: "Mobile", color: "#0d9488", bg: "#F0FDFA" },
};

export default function SourceBreakdown({ sourceBreakdown }: { sourceBreakdown: Record<string, number> }) {
    const { colors, isDark } = useTheme();
    const entries = Object.entries(sourceBreakdown);
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.text }]}>Orders by Platform</Text>
            <View style={s.row}>
                {entries.map(([key, count]) => {
                    const cfg = SOURCE_CONFIG[key] || { label: key, color: "#9CA3AF", bg: "#F9FAFB" };
                    return (
                        <View key={key} style={[s.item, { backgroundColor: isDark ? cfg.color + "20" : cfg.bg }]}>
                            <Text style={[s.itemCount, { color: cfg.color }]}>{count}</Text>
                            <Text style={[s.itemLabel, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    title: { fontSize: 15, fontWeight: "700", marginBottom: 14 },
    row: { flexDirection: "row", gap: 10 },
    item: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    itemCount: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    itemLabel: { fontSize: 12, fontWeight: "600" },
});
