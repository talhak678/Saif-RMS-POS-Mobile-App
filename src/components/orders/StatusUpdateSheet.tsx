import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import { useTheme } from "@/src/context/ThemeContext";
import { IOrder, IRider, OrderStatus } from "@/types/order.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props { isVisible: boolean; onClose: () => void; order: IOrder | null; onSuccess: () => void; }

const STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "KITCHEN_READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function StatusUpdateSheet({ isVisible, onClose, order, onSuccess }: Props) {
    const { colors, isDark } = useTheme();
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
    const [riders, setRiders] = useState<IRider[]>([]);
    const [selectedRider, setSelectedRider] = useState<string | null>(null);
    const [loadingRiders, setLoadingRiders] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (order) { setSelectedStatus(order.status); setSelectedRider(order.riderId ?? null); }
    }, [order, isVisible]);

    useEffect(() => {
        if (selectedStatus === "OUT_FOR_DELIVERY") fetchRiders();
    }, [selectedStatus]);

    const fetchRiders = async () => {
        setLoadingRiders(true);
        try {
            const res = await apiClient.get("/riders?status=AVAILABLE");
            if (res.data?.success) setRiders(res.data.data);
        } catch { } finally { setLoadingRiders(false); }
    };

    const handleSave = async () => {
        if (!order || !selectedStatus) return;
        setSaving(true);
        try {
            const body: any = { status: selectedStatus };
            if (selectedStatus === "OUT_FOR_DELIVERY") body.riderId = selectedRider;
            if (selectedStatus === "DELIVERED") body.paymentStatus = "PAID";
            const res = await apiClient.put(`/orders/${order.id}`, body);
            if (res.data?.success) { onSuccess(); onClose(); }
        } catch { } finally { setSaving(false); }
    };

    if (!order) return null;

    const sheetBg = isDark ? colors.card : '#fff';
    const optionBg = isDark ? colors.background : '#f9fafb';
    const optionBorder = isDark ? colors.border : '#e5e7eb';
    const divider = isDark ? colors.border : '#f3f4f6';

    return (
        <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={s.dismiss} activeOpacity={1} onPress={onClose} />
                <View style={[s.content, { backgroundColor: sheetBg }]}>
                    {/* Header */}
                    <View style={[s.header, { borderBottomColor: divider }]}>
                        <Text style={[s.title, { color: colors.text }]}>Update Order #{order.orderNo}</Text>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
                        <Text style={[s.label, { color: colors.text }]}>
                            Current Status: <Text style={{ color: Colors.primary, fontWeight: "800" }}>{order.status}</Text>
                        </Text>

                        <View style={s.options}>
                            {STATUSES.map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    onPress={() => setSelectedStatus(st)}
                                    style={[
                                        s.option,
                                        { backgroundColor: optionBg, borderColor: optionBorder },
                                        selectedStatus === st && { backgroundColor: Colors.primary + "10", borderColor: Colors.primary },
                                    ]}
                                >
                                    <View style={[s.radio, { borderColor: selectedStatus === st ? Colors.primary : (isDark ? colors.border : '#D1D5DB') }]}>
                                        {selectedStatus === st && <View style={s.radioInner} />}
                                    </View>
                                    <Text style={[
                                        s.optionLabel,
                                        { color: selectedStatus === st ? colors.text : colors.secondary },
                                        selectedStatus === st && { fontWeight: "700" },
                                    ]}>
                                        {st.replace(/_/g, " ")}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {selectedStatus === "OUT_FOR_DELIVERY" && (
                            <View style={[s.riderSection, { borderTopColor: divider }]}>
                                <Text style={[s.label, { color: colors.text }]}>Assign Rider</Text>
                                {loadingRiders ? (
                                    <ActivityIndicator color={Colors.primary} />
                                ) : riders.length === 0 ? (
                                    <Text style={[s.noRider, { color: colors.secondary }]}>No available riders found.</Text>
                                ) : (
                                    <View style={s.riderGrid}>
                                        {riders.map((r) => (
                                            <TouchableOpacity
                                                key={r.id}
                                                onPress={() => setSelectedRider(r.id)}
                                                style={[
                                                    s.riderChip,
                                                    { backgroundColor: optionBg, borderColor: optionBorder },
                                                    selectedRider === r.id && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                                                ]}
                                            >
                                                <Ionicons name="bicycle-outline" size={16} color={selectedRider === r.id ? "#fff" : colors.secondary} />
                                                <Text style={[s.riderName, { color: selectedRider === r.id ? "#fff" : colors.text }]}>{r.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    <View style={s.footer}>
                        <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, saving && { opacity: 0.7 }]}>
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    dismiss: { flex: 1 },
    content: { borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: 450, maxHeight: "85%", paddingBottom: 34 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: "800" },
    closeBtn: { padding: 4 },
    body: { padding: 20 },
    label: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
    options: { gap: 8, marginBottom: 20 },
    option: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioActive: { borderColor: Colors.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
    optionLabel: { fontSize: 14, fontWeight: "600" },
    riderSection: { marginTop: 10, paddingTop: 20, borderTopWidth: 1 },
    riderGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    riderChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
    riderName: { fontSize: 13, fontWeight: "600" },
    noRider: { fontSize: 13, fontStyle: "italic" },
    footer: { paddingHorizontal: 20, paddingTop: 10 },
    saveBtn: {
        backgroundColor: Colors.primary, padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center",
        shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
