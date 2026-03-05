import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import OrderDetailModal from "@/src/components/orders/OrderDetailModal";
import OrderHistoryRow from "@/src/components/orders/OrderHistoryRow";
import StatusUpdateSheet from "@/src/components/orders/StatusUpdateSheet";
import { useTheme } from "@/src/context/ThemeContext";
import { IOrder, OrderStatus } from "@/types/order.types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ── Status & Payment filter options ───────────────────────────────────────────
const STATUS_OPTIONS: (OrderStatus | "ALL")[] = [
    "ALL", "PENDING", "CONFIRMED", "PREPARING",
    "KITCHEN_READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];
const STATUS_LABELS: Record<string, string> = {
    ALL: "All", PENDING: "Pending", CONFIRMED: "Confirmed",
    PREPARING: "Preparing", KITCHEN_READY: "Ready",
    OUT_FOR_DELIVERY: "Delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
};
const PAYMENT_OPTIONS = ["ALL", "CASH", "CARD", "STRIPE"] as const;

function fmtDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function toISO(date: Date): string {
    return date.toISOString().split("T")[0];
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function OrderHistoryScreen() {
    const { colors, isDark } = useTheme();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    // API filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "CARD" | "STRIPE">("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Date picker state
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Modals
    const [detailOrder, setDetailOrder] = useState<IOrder | null>(null);
    const [updateOrder, setUpdateOrder] = useState<IOrder | null>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter !== "ALL") params.status = statusFilter;
            if (paymentFilter !== "ALL") params.payment = paymentFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await apiClient.get("/orders", { params });
            if (res.data?.success) setOrders(res.data.data);
        } catch { /* silent */ }
        finally { setLoading(false); setRefreshing(false); }
    }, [statusFilter, paymentFilter, startDate, endDate]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Client-side search ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return orders;
        return orders.filter(o =>
            String(o.orderNo).includes(q) ||
            (o.customer?.name ?? "").toLowerCase().includes(q) ||
            (o.customer?.phone ?? "").toLowerCase().includes(q)
        );
    }, [orders, search]);

    const deliveredCount = useMemo(() =>
        orders.filter(o => o.status === "DELIVERED").length, [orders]);

    const hasActiveFilters = statusFilter !== "ALL" || paymentFilter !== "ALL" || !!startDate || !!endDate || !!search;

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPaymentFilter("ALL");
        setStartDate("");
        setEndDate("");
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Ionicons name="chevron-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Orders</Text>
                    <TouchableOpacity onPress={() => { setRefreshing(true); fetchOrders(true); }} style={styles.iconBtn} disabled={refreshing}>
                        <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Sub-Tabs */}
                <View style={styles.tabRow}>
                    <TouchableOpacity style={styles.tab} onPress={() => router.replace("/orders/incoming" as any)}>
                        <Text style={[styles.tabText, { color: colors.secondary }]}>Live Orders</Text>
                    </TouchableOpacity>
                    <View style={[styles.tab, styles.activeTab]}>
                        <Text style={[styles.tabText, styles.activeTabText]}>History</Text>
                        <View style={styles.tabIndicator} />
                    </View>
                </View>
            </View>

            {/* Search + Filter Toggle */}
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={16} color={colors.secondary} />
                    <TextInput
                        placeholder="Search order # or customer name..."
                        placeholderTextColor={colors.secondary}
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchText, { color: colors.text }]}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch("")}>
                            <Ionicons name="close-circle" size={16} color={colors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => setFilterOpen(v => !v)}
                    style={[styles.filterToggleBtn, hasActiveFilters && styles.filterToggleBtnActive]}
                >
                    <Ionicons name={filterOpen ? "options" : "options-outline"} size={18} color={hasActiveFilters ? "#fff" : Colors.primary} />
                    {hasActiveFilters && <View style={styles.filterDot} />}
                </TouchableOpacity>
            </View>

            {/* Filter Panel */}
            {filterOpen && (
                <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <Text style={[styles.filterLabel, { color: colors.secondary }]}>Status</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                        {STATUS_OPTIONS.map(s => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setStatusFilter(s)}
                                style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }, statusFilter === s && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, { color: colors.secondary }, statusFilter === s && styles.chipTextActive]}>
                                    {STATUS_LABELS[s]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[styles.filterLabel, { color: colors.secondary, marginTop: 12 }]}>Payment Method</Text>
                    <View style={styles.chipRow}>
                        {PAYMENT_OPTIONS.map(p => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setPaymentFilter(p)}
                                style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }, paymentFilter === p && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, { color: colors.secondary }, paymentFilter === p && styles.chipTextActive]}>
                                    {p === "ALL" ? "All" : p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.filterLabel, { color: colors.secondary, marginTop: 12 }]}>Date Range</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.dateBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                            <Text style={[styles.dateBtnText, { color: colors.text }]}>{startDate ? fmtDate(new Date(startDate)) : "From Date"}</Text>
                        </TouchableOpacity>
                        <Ionicons name="arrow-forward" size={14} color={colors.secondary} />
                        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.dateBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                            <Text style={[styles.dateBtnText, { color: colors.text }]}>{endDate ? fmtDate(new Date(endDate)) : "To Date"}</Text>
                        </TouchableOpacity>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker value={startDate ? new Date(startDate) : new Date()} mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, d) => { setShowStartPicker(false); if (d) setStartDate(toISO(d)); }}
                            maximumDate={new Date()} />
                    )}
                    {showEndPicker && (
                        <DateTimePicker value={endDate ? new Date(endDate) : new Date()} mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(_, d) => { setShowEndPicker(false); if (d) setEndDate(toISO(d)); }}
                            maximumDate={new Date()} />
                    )}

                    <TouchableOpacity onPress={handleClearFilters} style={styles.clearBtn}>
                        <Ionicons name="close-circle-outline" size={15} color={Colors.error} />
                        <Text style={styles.clearBtnText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Summary Bar */}
            <View style={[styles.summaryBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.summaryPill}>
                    <Ionicons name="list-outline" size={12} color={Colors.primary} />
                    <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Total</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{orders.length}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryPill}>
                    <Ionicons name="bag-check-outline" size={12} color="#059669" />
                    <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Delivered</Text>
                    <Text style={[styles.summaryValue, { color: "#059669" }]}>{deliveredCount}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryPill}>
                    <Ionicons name="eye-outline" size={12} color={Colors.primary} />
                    <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Showing</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{filtered.length}</Text>
                </View>
            </View>

            {/* Order List */}
            {loading && !refreshing ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading order history…</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(true); }}
                            tintColor={Colors.primary} colors={[Colors.primary]} />
                    }
                    renderItem={({ item }) => (
                        <OrderHistoryRow order={item} onUpdate={o => setUpdateOrder(o)} onView={o => setDetailOrder(o)} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]}>
                                <Ionicons name="clipboard-outline" size={44} color="#D1D5DB" />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders match your filters</Text>
                            <TouchableOpacity onPress={handleClearFilters} style={[styles.emptyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={styles.emptyBtnText}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            )}

            <OrderDetailModal isVisible={!!detailOrder} onClose={() => setDetailOrder(null)} order={detailOrder} onUpdatePress={o => setUpdateOrder(o)} />
            <StatusUpdateSheet isVisible={!!updateOrder} onClose={() => setUpdateOrder(null)} order={updateOrder} onSuccess={() => fetchOrders(true)} />
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    // Header
    header: {
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? 40 : 54,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.light.background,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "800",
        color: Colors.light.text,
    },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.primary + "12",
        alignItems: "center",
        justifyContent: "center",
    },

    // Sub-tabs
    tabRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 24,
    },
    tab: {
        paddingVertical: 12,
        position: "relative",
    },
    activeTab: {},
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.light.secondary,
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: "800",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },

    // Search bar
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    searchInput: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    searchText: {
        flex: 1,
        fontSize: 14,
        color: Colors.light.text,
        paddingVertical: 0,
    },
    filterToggleBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: Colors.primary + "12",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderWidth: 1,
        borderColor: Colors.primary + "20",
    },
    filterToggleBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterDot: {
        position: "absolute",
        top: 7,
        right: 7,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#EF4444",
        borderWidth: 1.5,
        borderColor: "#fff",
    },

    // Filter Panel
    filterPanel: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.light.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        marginBottom: 8,
    },
    chipScroll: { flexGrow: 0 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginRight: 8,
        marginBottom: 4,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.light.secondary,
    },
    chipTextActive: {
        color: "#fff",
        fontWeight: "700",
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dateBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: Colors.light.background,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    dateBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.light.text,
    },
    clearBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        marginTop: 14,
    },
    clearBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.error,
    },

    // Summary
    summaryBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingVertical: 8,
    },
    summaryPill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    summaryDivider: {
        width: 1,
        height: 16,
        backgroundColor: Colors.light.border,
    },
    summaryLabel: {
        fontSize: 11,
        color: Colors.light.secondary,
        fontWeight: "500",
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: "800",
        color: Colors.light.text,
    },

    // List
    listContent: { padding: 14 },
    loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { color: Colors.light.secondary, fontSize: 14 },

    // Empty
    emptyWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        gap: 10,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.light.text,
    },
    emptyBtn: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 11,
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    emptyBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.error,
    },
});
