import { Colors } from "@/constants/theme";
import { ICustomer } from "@/types/customer.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CustomerRowProps {
    customer: ICustomer;
}

// Extract initials from name: "Ali Khan" → "AK"
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

// Format date: "2026-01-15T10:30:00Z" → "Jan 15, 2026"
function fmtDate(dateStr?: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function CustomerRow({ customer }: CustomerRowProps) {
    const orders = customer._count?.orders ?? 0;
    const initials = getInitials(customer.name ?? "?");

    return (
        <View style={styles.row}>
            {/* Avatar */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Main info */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {customer.name}
                    </Text>
                    {/* Order count pill */}
                    <View style={styles.orderPill}>
                        <Text style={styles.orderPillText}>{orders} Order{orders !== 1 ? "s" : ""}</Text>
                    </View>
                </View>

                {/* Email */}
                <Text style={styles.sub} numberOfLines={1}>
                    {customer.email ?? "—"}
                </Text>

                <View style={styles.bottomRow}>
                    {/* Phone */}
                    <View style={styles.inlineRow}>
                        <Ionicons name="call-outline" size={11} color="#6B7280" />
                        <Text style={styles.sub}>{customer.phone ?? "—"}</Text>
                    </View>

                    {/* Loyalty points */}
                    {(customer.loyaltyPoints ?? 0) > 0 && (
                        <View style={styles.inlineRow}>
                            <Ionicons name="wallet-outline" size={11} color="#d97706" />
                            <Text style={[styles.sub, { color: "#d97706", fontWeight: "600" }]}>
                                {customer.loyaltyPoints} pts
                            </Text>
                        </View>
                    )}

                    {/* Joined date */}
                    <Text style={[styles.sub, { marginLeft: "auto" }]}>
                        {fmtDate(customer.createdAt)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary + "20",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    avatarText: {
        fontSize: 15,
        fontWeight: "800",
        color: Colors.primary,
    },
    info: { flex: 1, gap: 3 },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        flex: 1,
    },
    orderPill: {
        backgroundColor: Colors.primary + "15",
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 3,
    },
    orderPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.primary,
    },
    sub: {
        fontSize: 12,
        color: "#6B7280",
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 2,
    },
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
});
