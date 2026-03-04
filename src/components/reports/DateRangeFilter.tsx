import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface DateRangeFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (d: string) => void;
    onEndDateChange: (d: string) => void;
    onClear: () => void;
}

/** Format YYYY-MM-DD → "Mar 03, 2026" */
function displayDate(d: string): string {
    if (!d) return "Select";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Simple cross-platform date modal */
function DateModal({
    visible,
    current,
    onConfirm,
    onDismiss,
}: {
    visible: boolean;
    current: string;
    onConfirm: (d: string) => void;
    onDismiss: () => void;
}) {
    const [val, setVal] = useState(current || new Date().toISOString().slice(0, 10));

    const confirm = () => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (regex.test(val)) { onConfirm(val); onDismiss(); }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity style={m.overlay} activeOpacity={1} onPress={onDismiss}>
                <View style={m.box}>
                    <Text style={m.title}>Select Date</Text>
                    <Text style={m.hint}>Format: YYYY-MM-DD</Text>
                    <TextInput
                        style={m.input}
                        value={val}
                        onChangeText={setVal}
                        keyboardType="numeric"
                        maxLength={10}
                        placeholder="2026-01-01"
                    />
                    <View style={m.btns}>
                        <TouchableOpacity style={m.cancel} onPress={onDismiss}>
                            <Text style={m.cancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={m.confirm} onPress={confirm}>
                            <Text style={m.confirmTxt}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function DateRangeFilter({
    startDate, endDate, onStartDateChange, onEndDateChange, onClear,
}: DateRangeFilterProps) {
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const hasDate = !!startDate || !!endDate;
    const warning = (startDate && !endDate) || (!startDate && endDate);

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                {/* From */}
                <TouchableOpacity style={styles.pill} onPress={() => setShowStart(true)}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <View>
                        <Text style={styles.pillLabel}>FROM</Text>
                        <Text style={[styles.pillValue, !startDate && styles.placeholder]}>
                            {startDate ? displayDate(startDate) : "Select"}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                {/* To */}
                <TouchableOpacity style={styles.pill} onPress={() => setShowEnd(true)}>
                    <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                    <View>
                        <Text style={styles.pillLabel}>TO</Text>
                        <Text style={[styles.pillValue, !endDate && styles.placeholder]}>
                            {endDate ? displayDate(endDate) : "Select"}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Clear */}
                {hasDate && (
                    <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {warning && (
                <Text style={styles.warning}>⚠️ Please select both dates to filter</Text>
            )}

            <DateModal
                visible={showStart}
                current={startDate}
                onConfirm={onStartDateChange}
                onDismiss={() => setShowStart(false)}
            />
            <DateModal
                visible={showEnd}
                current={endDate}
                onConfirm={onEndDateChange}
                onDismiss={() => setShowEnd(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { marginHorizontal: 16, marginBottom: 12 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    pill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    pillLabel: { fontSize: 9, fontWeight: "700", color: Colors.light.secondary, letterSpacing: 0.6 },
    pillValue: { fontSize: 13, fontWeight: "600", color: Colors.light.text },
    placeholder: { color: Colors.light.secondary },
    divider: { width: 1, height: 32, backgroundColor: Colors.light.border },
    clearBtn: { padding: 2 },
    warning: { fontSize: 12, color: "#f59e0b", marginTop: 6, marginLeft: 4 },
});

const m = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center", alignItems: "center",
    },
    box: {
        backgroundColor: "#fff", borderRadius: 20,
        padding: 24, width: 300, gap: 12,
    },
    title: { fontSize: 17, fontWeight: "800", color: "#111827", textAlign: "center" },
    hint: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
    input: {
        borderWidth: 1.5, borderColor: Colors.light.border,
        borderRadius: 12, padding: 12,
        fontSize: 16, color: "#111827", textAlign: "center",
    },
    btns: { flexDirection: "row", gap: 10 },
    cancel: {
        flex: 1, borderWidth: 1, borderColor: Colors.light.border,
        borderRadius: 12, paddingVertical: 12, alignItems: "center",
    },
    cancelTxt: { fontSize: 14, fontWeight: "600", color: Colors.light.secondary },
    confirm: {
        flex: 1, backgroundColor: Colors.primary,
        borderRadius: 12, paddingVertical: 12, alignItems: "center",
    },
    confirmTxt: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
