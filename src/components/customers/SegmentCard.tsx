import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SegmentCardProps {
    label: string;
    desc: string;
    count: number;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    isActive: boolean;
    onPress: () => void;
}

export default function SegmentCard({
    label,
    desc,
    count,
    accentColor,
    badgeBg,
    badgeText,
    isActive,
    onPress,
}: SegmentCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.card,
                { borderLeftColor: accentColor },
                isActive && styles.cardActive,
            ]}
        >
            {/* Top row: label + badge */}
            <View style={styles.topRow}>
                <Text style={styles.label} numberOfLines={1}>
                    {label}
                </Text>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeText }]}>{count}</Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.desc}>{desc}</Text>

            {/* Action link */}
            <Text style={[styles.action, { color: isActive ? "#dc2626" : Colors.primary }]}>
                {isActive ? "✕ Clear Filter" : "View Customers →"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderLeftWidth: 4,
        padding: 12,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        gap: 4,
    },
    cardActive: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderLeftWidth: 4,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#111827",
        flex: 1,
        marginRight: 6,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 7,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: "center",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    desc: {
        fontSize: 10,
        color: "#6B7280",
        lineHeight: 14,
    },
    action: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
});
