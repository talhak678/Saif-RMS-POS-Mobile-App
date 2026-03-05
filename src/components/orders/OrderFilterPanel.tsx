import { Colors } from "@/constants/theme";
import { OrderStatus } from "@/types/order.types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface OrderFilterPanelProps {
    search: string;
    onSearchChange: (text: string) => void;
    status: OrderStatus | "ALL";
    onStatusChange: (status: OrderStatus | "ALL") => void;
    payment: "ALL" | "CASH" | "CARD" | "STRIPE";
    onPaymentChange: (pm: "ALL" | "CASH" | "CARD" | "STRIPE") => void;
    startDate: string;
    onStartDateChange: (date: string) => void;
    endDate: string;
    onEndDateChange: (date: string) => void;
    onClear: () => void;
}

const STATUSES: (OrderStatus | "ALL")[] = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "KITCHEN_READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
];

const PAYMENTS: ("ALL" | "CASH" | "CARD" | "STRIPE")[] = ["ALL", "CASH", "CARD", "STRIPE"];

export default function OrderFilterPanel({
    search,
    onSearchChange,
    status,
    onStatusChange,
    payment,
    onPaymentChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    onClear,
}: OrderFilterPanelProps) {
    const [expanded, setExpanded] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const onChangeStart = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            onStartDateChange(selectedDate.toISOString().split("T")[0]);
        }
    };

    const onChangeEnd = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            onEndDateChange(selectedDate.toISOString().split("T")[0]);
        }
    };

    return (
        <View style={styles.container}>
            {/* 🔍 Search + Expand Toggle */}
            <View style={styles.topBar}>
                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                    <TextInput
                        placeholder="Order ID / Customer / Phone"
                        style={styles.input}
                        value={search}
                        onChangeText={onSearchChange}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setExpanded(!expanded)}
                    style={[styles.filterBtn, expanded && styles.filterBtnActive]}
                >
                    <Ionicons name="options-outline" size={20} color={expanded ? "#fff" : "#4B5563"} />
                </TouchableOpacity>
            </View>

            {/* ⚙ Expanded Panel */}
            {expanded && (
                <View style={styles.panel}>
                    {/* Status Chips */}
                    <Text style={styles.label}>Order Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {STATUSES.map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => onStatusChange(s)}
                                style={[styles.chip, status === s && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                                    {s.replace(/_/g, " ")}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Payment Chips */}
                    <Text style={styles.label}>Payment Method</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {PAYMENTS.map((p) => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => onPaymentChange(p)}
                                style={[styles.chip, payment === p && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, payment === p && styles.chipTextActive]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Date Pickers */}
                    <View style={styles.dateRow}>
                        <View style={styles.dateCol}>
                            <Text style={styles.label}>From Date</Text>
                            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePickerBtn}>
                                <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                                <Text style={styles.dateValue}>{startDate || "Pick date"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dateCol}>
                            <Text style={styles.label}>To Date</Text>
                            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePickerBtn}>
                                <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                                <Text style={styles.dateValue}>{endDate || "Pick date"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate ? new Date(startDate) : new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={onChangeStart}
                        />
                    )}

                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate ? new Date(endDate) : new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={onChangeEnd}
                        />
                    )}

                    {/* Action Row */}
                    <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                        <Text style={styles.clearText}>Clear All Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    topBar: {
        flexDirection: "row",
        gap: 10,
    },
    searchWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
    },
    filterBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    panel: {
        marginTop: 16,
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
    },
    chipScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#f3f4f6",
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "transparent",
    },
    chipActive: {
        backgroundColor: Colors.primary + "15",
        borderColor: Colors.primary + "40",
    },
    chipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4B5563",
    },
    chipTextActive: {
        color: Colors.primary,
    },
    dateRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateCol: {
        flex: 1,
    },
    datePickerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 10,
    },
    dateValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
    },
    clearBtn: {
        marginTop: 8,
        alignItems: "center",
        padding: 12,
    },
    clearText: {
        color: "#EF4444",
        fontSize: 14,
        fontWeight: "700",
    },
});
