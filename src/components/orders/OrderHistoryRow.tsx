import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { IOrder, OrderType, STATUS_CONFIG } from "@/types/order.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props { order: IOrder; onUpdate: (order: IOrder) => void; onView: (order: IOrder) => void; }

const TYPE_ICONS: Record<OrderType, keyof typeof Ionicons.glyphMap> = {
    DELIVERY: "bicycle-outline", PICKUP: "bag-handle-outline", DINE_IN: "restaurant-outline",
};

export default function OrderHistoryRow({ order, onUpdate, onView }: Props) {
    const { colors, isDark } = useTheme();
    const cfg = STATUS_CONFIG[order.status];
    const d = new Date(order.createdAt);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const cardBg = isDark ? colors.card : "#ffffff";
    const border = isDark ? colors.border : "#F3F4F6";
    const trackBg = isDark ? colors.border : "#F9FAFB";

    return (
        <View style={[s.card, { backgroundColor: cardBg, borderColor: border, borderLeftColor: cfg.dotColor }]}>
            {/* Top */}
            <View style={s.topRow}>
                <View style={s.orderIdent}>
                    <Text style={[s.orderNo, { color: colors.text }]}>#{order.orderNo}</Text>
                    <View style={[s.typePill, { backgroundColor: isDark ? colors.border : "#F3F4F6" }]}>
                        <Ionicons name={TYPE_ICONS[order.type]} size={11} color={colors.secondary} />
                        <Text style={[s.typeText, { color: colors.secondary }]}>{order.type.replace("_", " ")}</Text>
                    </View>
                </View>
                <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
                    <View style={[s.statusDot, { backgroundColor: cfg.dotColor }]} />
                    <Text style={[s.statusLabel, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={[s.content, {}]}>
                <View style={s.infoRow}>
                    <Ionicons name="person-outline" size={13} color={Colors.primary} />
                    <Text style={[s.custName, { color: colors.text }]}>{order.customer?.name ?? "Guest"}</Text>
                    {order.customer?.phone && <Text style={[s.custPhone, { color: colors.secondary }]}>·  {order.customer.phone}</Text>}
                </View>
                <View style={s.infoRow}>
                    <Ionicons name="storefront-outline" size={13} color={Colors.primary} />
                    <Text style={[s.branchName, { color: colors.text }]}>{order.branch?.name ?? "—"}</Text>
                    <Text style={[s.dateTime, { color: colors.secondary }]}>· {dateStr}  {timeStr}</Text>
                </View>
                <View style={s.paymentRow}>
                    <View style={s.payLeft}>
                        <Ionicons name="card-outline" size={13} color={colors.secondary} />
                        <View style={[s.payMethodBadge, { backgroundColor: isDark ? colors.border : "#F9FAFB", borderColor: border }]}>
                            <Text style={[s.payMethodText, { color: colors.secondary }]}>{order.payment?.method ?? "—"}</Text>
                        </View>
                    </View>
                    <Text style={[s.amount, { color: colors.text }]}>${parseFloat(order.total).toFixed(2)}</Text>
                </View>
            </View>

            <View style={[s.divider, { backgroundColor: border }]} />

            {/* Actions */}
            <View style={s.footer}>
                <TouchableOpacity onPress={() => onUpdate(order)} style={[s.btn, { backgroundColor: Colors.primary + "08", borderColor: Colors.primary + "30" }]}>
                    <Ionicons name="refresh-outline" size={15} color={Colors.primary} />
                    <Text style={[s.btnLabelPrimary]}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onView(order)} style={[s.btn, { backgroundColor: trackBg, borderColor: border }]}>
                    <Ionicons name="eye-outline" size={15} color={colors.secondary} />
                    <Text style={[s.btnLabel, { color: colors.secondary }]}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    orderIdent: { flexDirection: "row", alignItems: "center", gap: 8 },
    orderNo: { fontSize: 15, fontWeight: "800" },
    typePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    typeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 10, fontWeight: "800" },
    content: { gap: 6, marginBottom: 10 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    custName: { fontSize: 14, fontWeight: "700" },
    custPhone: { fontSize: 12 },
    branchName: { fontSize: 12, fontWeight: "600" },
    dateTime: { fontSize: 12 },
    paymentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
    payLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
    payMethodBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
    payMethodText: { fontSize: 11, fontWeight: "700" },
    amount: { fontSize: 16, fontWeight: "800" },
    divider: { height: 1, marginHorizontal: -14, marginBottom: 10 },
    footer: { flexDirection: "row", gap: 10 },
    btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
    btnLabelPrimary: { fontSize: 13, fontWeight: "700", color: Colors.primary },
    btnLabel: { fontSize: 13, fontWeight: "700" },
});
