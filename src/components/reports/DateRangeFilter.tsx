import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (d: string) => void;
    onEndDateChange: (d: string) => void;
    onClear: () => void;
}

function displayDate(d: string): string {
    if (!d) return "Select";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DateModal({ visible, current, onConfirm, onDismiss }: { visible: boolean; current: string; onConfirm: (d: string) => void; onDismiss: () => void }) {
    const { colors } = useTheme();
    const [val, setVal] = useState(current || new Date().toISOString().slice(0, 10));
    const confirm = () => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) { onConfirm(val); onDismiss(); }
    };
    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onDismiss}>
                <View style={[m.box, { backgroundColor: colors.card }]}>
                    <Text style={[m.title, { color: colors.text }]}>Select Date</Text>
                    <Text style={[m.hint, { color: colors.secondary }]}>Format: YYYY-MM-DD</Text>
                    <TextInput
                        style={[m.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                        value={val}
                        onChangeText={setVal}
                        keyboardType="numeric"
                        maxLength={10}
                        placeholder="2026-01-01"
                        placeholderTextColor={colors.secondary}
                    />
                    <View style={m.btns}>
                        <TouchableOpacity style={[m.cancel, { borderColor: colors.border }]} onPress={onDismiss}>
                            <Text style={[m.cancelTxt, { color: colors.secondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[m.confirm, { backgroundColor: Colors.primary }]} onPress={confirm}>
                            <Text style={m.confirmTxt}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }: DateRangeFilterProps) {
    const { colors } = useTheme();
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const hasDate = !!startDate || !!endDate;
    const warning = (startDate && !endDate) || (!startDate && endDate);

    return (
        <View style={s.wrap}>
            <View style={[s.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity style={s.pill} onPress={() => setShowStart(true)}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <View>
                        <Text style={[s.pillLabel, { color: colors.secondary }]}>FROM</Text>
                        <Text style={[s.pillValue, { color: colors.text }, !startDate && { color: colors.secondary }]}>
                            {startDate ? displayDate(startDate) : "Select"}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={[s.divider, { backgroundColor: colors.border }]} />

                <TouchableOpacity style={s.pill} onPress={() => setShowEnd(true)}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <View>
                        <Text style={[s.pillLabel, { color: colors.secondary }]}>TO</Text>
                        <Text style={[s.pillValue, { color: colors.text }, !endDate && { color: colors.secondary }]}>
                            {endDate ? displayDate(endDate) : "Select"}
                        </Text>
                    </View>
                </TouchableOpacity>

                {hasDate && (
                    <TouchableOpacity onPress={onClear} style={s.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {warning && <Text style={s.warning}>⚠️ Please select both dates to filter</Text>}

            <DateModal visible={showStart} current={startDate} onConfirm={onStartDateChange} onDismiss={() => setShowStart(false)} />
            <DateModal visible={showEnd} current={endDate} onConfirm={onEndDateChange} onDismiss={() => setShowEnd(false)} />
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { marginHorizontal: 16, marginBottom: 12 },
    row: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    pill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    pillLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.6 },
    pillValue: { fontSize: 13, fontWeight: "600" },
    divider: { width: 1, height: 32 },
    clearBtn: { padding: 2 },
    warning: { fontSize: 12, color: "#f59e0b", marginTop: 6, marginLeft: 4 },
});

const m = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    box: { borderRadius: 20, padding: 24, width: 300, gap: 12 },
    title: { fontSize: 17, fontWeight: "800", textAlign: "center" },
    hint: { fontSize: 12, textAlign: "center" },
    input: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 16, textAlign: "center" },
    btns: { flexDirection: "row", gap: 10 },
    cancel: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
    cancelTxt: { fontSize: 14, fontWeight: "600" },
    confirm: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
    confirmTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
