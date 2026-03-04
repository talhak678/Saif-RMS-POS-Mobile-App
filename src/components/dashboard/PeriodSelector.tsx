import { Colors } from "@/constants/theme";
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
    return (
        <View style={styles.container}>
            {PERIODS.map((p) => {
                const active = p.value === selected;
                return (
                    <TouchableOpacity
                        key={p.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => onSelect(p.value)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        padding: 3,
        gap: 3,
    },
    chip: {
        flex: 1,
        paddingVertical: 7,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    chipActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    chipText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
    },
    chipTextActive: {
        color: "#fff",
        fontWeight: "700",
    },
});
