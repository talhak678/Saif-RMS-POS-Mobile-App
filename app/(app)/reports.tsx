import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import AnalyticsTab from "@/src/components/reports/AnalyticsTab";
import BranchesTab from "@/src/components/reports/BranchesTab";
import DateRangeFilter from "@/src/components/reports/DateRangeFilter";
import InventoryTab from "@/src/components/reports/InventoryTab";
import MenuCategoriesTab from "@/src/components/reports/MenuCategoriesTab";
import OrdersCustomersTab from "@/src/components/reports/OrdersCustomersTab";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { IReportData } from "@/types/reports.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// ─── Tabs Config ──────────────────────────────────────────────────────────────
const ALL_TABS = [
    { key: 0, label: "Analytics" },
    { key: 1, label: "Orders & Customers" },
    { key: 2, label: "Inventory" },
    { key: 3, label: "Branches" },
    { key: 4, label: "Menu & Categories" },
];

const SUPER_ADMIN_TABS = [0, 1, 3]; // Analytics, Orders, Branches only

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtVal(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onLoad, colors }: { onLoad: () => void; colors: any }) {
    return (
        <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={52} color="#D1D5DB" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Report Data</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
                Select a date range or tap below to load all-time data
            </Text>
            <TouchableOpacity style={styles.loadBtn} onPress={onLoad}>
                <Text style={styles.loadBtnText}>Load Reports</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ReportsDashboard() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const isSuperAdmin = user?.role?.name === "SUPER_ADMIN";
    const visibleTabs = isSuperAdmin
        ? ALL_TABS.filter((t) => SUPER_ADMIN_TABS.includes(t.key))
        : ALL_TABS;

    const [data, setData] = useState<IReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    // Underline animation
    const underlineAnim = useRef(new Animated.Value(0)).current;

    const canFetch =
        (!startDate && !endDate) || (!!startDate && !!endDate);

    const fetchReports = useCallback(
        async (showLoader = true) => {
            if (!canFetch) return;
            if (showLoader) setLoading(true);
            setError(null);
            try {
                const params: Record<string, string> = {};
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                const res = await apiClient.get("/reports", { params });
                if (res.data?.success) {
                    setData(res.data.data);
                } else {
                    setError(res.data?.message || "Failed to load reports");
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || "Network error. Try again.");
            } finally {
                setLoading(false);
            }
        },
        [startDate, endDate, canFetch]
    );

    // Re-fetch when both dates are set or both cleared
    useEffect(() => {
        if (canFetch && (startDate || endDate || data === null)) {
            // Don't auto-fetch on first mount (wait for Load button or date selection)
        }
    }, [startDate, endDate]);

    // Tab animation
    const handleTabPress = (idx: number) => {
        Animated.timing(underlineAnim, {
            toValue: idx,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setActiveTab(idx);
    };

    // Export CSV
    // const handleExport = async () => {
    //     if (!data) {
    //         Alert.alert("No Data", "Load report data first before exporting.");
    //         return;
    //     }
    //     const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    //     const rows: string[][] = [];

    //     rows.push(["=== SUMMARY ==="]);
    //     rows.push(["Metric", "Total", "Change %"]);
    //     Object.entries(data.summary).forEach(([key, val]) => {
    //         rows.push([key, String(val.total), String(val.change)]);
    //     });
    //     rows.push([]);
    //     rows.push(["=== SALES TREND (DAILY) ==="]);
    //     rows.push(["Date", "Sales ($)", "Orders"]);
    //     data.salesTrend.daily.forEach((r) =>
    //         rows.push([r.date, String(r.sales), String(r.orders)])
    //     );
    //     rows.push([]);
    //     rows.push(["=== ORDER SOURCE ==="]);
    //     rows.push(["Source", "Orders"]);
    //     data.ordersCustomers.orderSource.forEach((s) =>
    //         rows.push([s.name, String(s.value)])
    //     );

    //     const csv = rows
    //         .map((row) =>
    //             row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    //         )
    //         .join("\n");

    //     try {
    //         if (Platform.OS === "web") {
    //             const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
    //             const url = URL.createObjectURL(blob);
    //             const a = document.createElement("a");
    //             a.href = url;
    //             a.download = `report_${today}.csv`;
    //             a.click();
    //             URL.revokeObjectURL(url);
    //         } else {
    //             const fileUri = `${FileSystem.cacheDirectory}report_${today}.csv`;
    //             await FileSystem.writeAsStringAsync(fileUri, "\uFEFF" + csv, {
    //                 encoding: "utf8",
    //             });
    //             await Sharing.shareAsync(fileUri, {
    //                 mimeType: "text/csv",
    //                 dialogTitle: "Export Report",
    //             });
    //         }
    //     } catch (e) {
    //         Alert.alert("Export Failed", "Could not export report.");
    //     }
    // };

    // Render active tab content
    const renderTab = () => {
        if (!data) return null;
        const tabKey = visibleTabs[activeTab]?.key ?? 0;
        switch (tabKey) {
            case 0: return <AnalyticsTab data={data} />;
            case 1: return <OrdersCustomersTab data={data} />;
            case 2: return <InventoryTab data={data} />;
            case 3: return <BranchesTab data={data} />;
            case 4: return <MenuCategoriesTab data={data} />;
            default: return null;
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="chevron-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Reports Dashboard</Text>
            </View>

            {/* Date Filter */}
            <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(d) => setStartDate(d)}
                onEndDateChange={(d) => setEndDate(d)}
                onClear={() => { setStartDate(""); setEndDate(""); }}
            />

            {/* Tab Bar */}
            <View style={[styles.tabContainer, {}]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {visibleTabs.map((tab, i) => (
                        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => handleTabPress(i)} activeOpacity={0.75}>
                            <Text style={[styles.tabText, { color: colors.secondary }, activeTab === i && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                            {activeTab === i && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={[styles.tabBorder, { backgroundColor: colors.border }]} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading reports…</Text>
                </View>
            ) : error ? (
                <View style={styles.errorWrap}>
                    <Ionicons name="cloud-offline-outline" size={44} color="#9CA3AF" />
                    <Text style={[styles.errorText, { color: colors.secondary }]}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReports()}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : data ? (
                <View style={styles.tabContent}>
                    {renderTab()}
                </View>
            ) : (
                <EmptyState onLoad={() => fetchReports()} colors={colors} />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "android" ? 40 : 52,
    },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.light.card,
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
    exportBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: Colors.primary + "15",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    exportText: { fontSize: 13, fontWeight: "700", color: Colors.primary },

    // Tabs
    tabContainer: { position: "relative", marginBottom: 4 },
    tabScroll: { paddingHorizontal: 16, gap: 4 },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
        position: "relative",
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#9CA3AF",
    },
    tabTextActive: { color: Colors.primary, fontWeight: "700" },
    tabUnderline: {
        position: "absolute",
        bottom: 0,
        left: 8,
        right: 8,
        height: 2.5,
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    tabBorder: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginHorizontal: 16,
    },

    // Tab content
    tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

    // Loading
    loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: { fontSize: 14, color: Colors.light.secondary },

    // Error
    errorWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 12,
    },
    errorText: {
        fontSize: 14,
        color: Colors.light.secondary,
        textAlign: "center",
        lineHeight: 20,
    },
    retryBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
    },
    retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    // Empty
    emptyWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: Colors.light.text },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.light.secondary,
        textAlign: "center",
        lineHeight: 20,
    },
    loadBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 14,
        marginTop: 4,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loadBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
