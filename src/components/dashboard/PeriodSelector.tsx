import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { DashboardPeriod } from "@/types/dashboard.types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PERIODS: { label: string; value: DashboardPeriod }[] = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
];

interface PeriodSelectorProps {
    selected: DashboardPeriod;
    onSelect: (p: DashboardPeriod) => void;
}

export default function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
    const { colors, isDark } = useTheme();
    return (
        <View style={[s.container, { backgroundColor: isDark ? colors.card : "#F3F4F6", borderColor: colors.border }]}>
            {PERIODS.map((p) => {
                const active = p.value === selected;
                return (
                    <TouchableOpacity
                        key={p.value}
                        style={[s.chip, active && s.chipActive]}
                        onPress={() => onSelect(p.value)}
                        activeOpacity={0.75}
                    >
                        <Text style={[s.chipText, { color: active ? "#fff" : colors.secondary }, active && s.chipTextActive]}>
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flexDirection: "row", marginHorizontal: 16, marginBottom: 14,
        borderRadius: 12, padding: 3, gap: 3, borderWidth: 1,
    },
    chip: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    chipActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary, shadowOpacity: 0.25, shadowRadius: 4, elevation: 2,
    },
    chipText: { fontSize: 12, fontWeight: "600" },
    chipTextActive: { color: "#fff", fontWeight: "700" },
});
