import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { ICustomer } from "@/types/customer.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function getInitials(name: string): string {
    return name.split(" ").map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase();
}
function fmtDate(dateStr?: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CustomerRow({ customer }: { customer: ICustomer }) {
    const { colors } = useTheme();
    const orders = customer._count?.orders ?? 0;
    const initials = getInitials(customer.name ?? "?");

    return (
        <View style={[s.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.avatar, { backgroundColor: Colors.primary + "20" }]}>
                <Text style={s.avatarText}>{initials}</Text>
            </View>

            <View style={s.info}>
                <View style={s.nameRow}>
                    <Text style={[s.name, { color: colors.text }]} numberOfLines={1}>{customer.name}</Text>
                    <View style={[s.orderPill, { backgroundColor: Colors.primary + "15" }]}>
                        <Text style={s.orderPillText}>{orders} Order{orders !== 1 ? "s" : ""}</Text>
                    </View>
                </View>

                <Text style={[s.sub, { color: colors.secondary }]} numberOfLines={1}>{customer.email ?? "—"}</Text>

                <View style={s.bottomRow}>
                    <View style={s.inlineRow}>
                        <Ionicons name="call-outline" size={11} color={colors.secondary} />
                        <Text style={[s.sub, { color: colors.secondary }]}>{customer.phone ?? "—"}</Text>
                    </View>
                    {(customer.loyaltyPoints ?? 0) > 0 && (
                        <View style={s.inlineRow}>
                            <Ionicons name="wallet-outline" size={11} color="#d97706" />
                            <Text style={[s.sub, { color: "#d97706", fontWeight: "600" }]}>{customer.loyaltyPoints} pts</Text>
                        </View>
                    )}
                    <Text style={[s.sub, { color: colors.secondary, marginLeft: "auto" }]}>{fmtDate(customer.createdAt)}</Text>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1, gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    avatarText: { fontSize: 15, fontWeight: "800", color: Colors.primary },
    info: { flex: 1, gap: 3 },
    nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    name: { fontSize: 14, fontWeight: "700", flex: 1 },
    orderPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    orderPillText: { fontSize: 11, fontWeight: "700", color: Colors.primary },
    sub: { fontSize: 12 },
    bottomRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 },
    inlineRow: { flexDirection: "row", alignItems: "center", gap: 3 },
});
