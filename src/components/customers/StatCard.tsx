import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
}

export default function StatCard({ label, value, icon, iconColor, iconBg }: StatCardProps) {
    const { colors } = useTheme();
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={[s.value, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            <Text style={[s.label, { color: colors.secondary }]}>{label}</Text>
        </View>
    );
}

const s = StyleSheet.create({
    card: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, gap: 6 },
    iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    value: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
});
