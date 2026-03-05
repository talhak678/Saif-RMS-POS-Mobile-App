import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import ActiveSegmentBanner from "@/src/components/customers/ActiveSegmentBanner";
import CustomerRow from "@/src/components/customers/CustomerRow";
import SearchBar from "@/src/components/customers/SearchBar";
import SegmentCard from "@/src/components/customers/SegmentCard";
import StatCard from "@/src/components/customers/StatCard";
import { useTheme } from "@/src/context/ThemeContext";
import {
    ICustomer,
    ICustomerStats,
    matchesSegment,
    SEGMENT_CONFIG,
    SegmentKey,
} from "@/types/customer.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CustomersScreen() {
    const { colors, isDark } = useTheme();
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [stats, setStats] = useState<ICustomerStats | null>(null);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeSegment, setActiveSegment] = useState<SegmentKey>(null);
    const [searchName, setSearchName] = useState("");
    const [searchPhone, setSearchPhone] = useState("");
    const [searchEmail, setSearchEmail] = useState("");

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchCustomers = useCallback(async () => {
        setLoadingCustomers(true);
        try {
            const res = await apiClient.get("/customers");
            if (res.data?.success) setCustomers(res.data.data);
        } catch {
            // silently fail
        } finally {
            setLoadingCustomers(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const res = await apiClient.get("/customers/stats");
            if (res.data?.success) setStats(res.data.data);
        } catch {
            // silently fail
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        await Promise.all([fetchCustomers(), fetchStats()]);
        setRefreshing(false);
    }, [fetchCustomers, fetchStats]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAll();
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ── Combined client-side filter ─────────────────────────────────────────

    const filtered = useMemo(() => {
        return customers.filter((c) => {
            const nameOk = (c.name ?? "").toLowerCase().includes(searchName.toLowerCase());
            const phoneOk = (c.phone ?? "").toLowerCase().includes(searchPhone.toLowerCase());
            const emailOk = (c.email ?? "").toLowerCase().includes(searchEmail.toLowerCase());
            const segOk = activeSegment === null || matchesSegment(c, activeSegment);
            return nameOk && phoneOk && emailOk && segOk;
        });
    }, [customers, searchName, searchPhone, searchEmail, activeSegment]);

    // ── Active segment label ─────────────────────────────────────────────────
    const activeSegmentConfig = activeSegment
        ? SEGMENT_CONFIG.find((s) => s.key === activeSegment)
        : null;

    // ── Loading state ─────────────────────────────────────────────────────────
    const isLoading = loadingCustomers || loadingStats;

    // ── Segment toggle ─────────────────────────────────────────────────────────
    const handleSegmentPress = (key: SegmentKey) => {
        setActiveSegment((prev) => (prev === key ? null : key));
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="chevron-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Customer Management</Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    style={styles.refreshBtn}
                    disabled={refreshing}
                >
                    <Ionicons
                        name="refresh-outline"
                        size={20}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.secondary }]}>Loading customers…</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                    // ── List Header (stats + segments + search) ──
                    ListHeaderComponent={
                        <View>
                            {/* Summary Stats — 2×2 grid */}
                            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>Overview</Text>
                            <View style={styles.grid2}>
                                <StatCard
                                    label="Total Customers"
                                    value={String(stats?.summary.totalCustomers ?? "—")}
                                    icon="people-outline"
                                    iconColor="#5d69b9"
                                    iconBg={isDark ? "#5d69b920" : "#eef0fb"}
                                />
                                <StatCard
                                    label="Repeat Rate"
                                    value={stats?.summary.repeatRate ?? "—"}
                                    icon="refresh-outline"
                                    iconColor="#059669"
                                    iconBg={isDark ? "#05966920" : "#d1fae5"}
                                />
                            </View>
                            <View style={[styles.grid2, { marginBottom: 20 }]}>
                                <StatCard
                                    label="Avg Order Value"
                                    value={stats ? `$ ${stats.summary.averageOrderValue}` : "—"}
                                    icon="wallet-outline"
                                    iconColor="#d97706"
                                    iconBg={isDark ? "#d9770620" : "#fef3c7"}
                                />
                                <StatCard
                                    label="Retention Rate"
                                    value={stats?.summary.retentionRate ?? "—"}
                                    icon="trending-up-outline"
                                    iconColor="#2563eb"
                                    iconBg={isDark ? "#2563eb20" : "#eff6ff"}
                                />
                            </View>

                            {/* Smart Segments — 2-column, 4 rows */}
                            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>Smart Segments</Text>
                            {SEGMENT_CONFIG.reduce<(typeof SEGMENT_CONFIG[number])[][]>((acc, seg, i) => {
                                if (i % 2 === 0) acc.push([]);
                                acc[acc.length - 1].push(seg);
                                return acc;
                            }, []).map((pair, rowIdx) => (
                                <View key={rowIdx} style={[styles.grid2, { marginBottom: 10 }]}>
                                    {pair.map((seg) => {
                                        const count = stats?.segments?.[seg.key] ?? 0;
                                        return (
                                            <SegmentCard
                                                key={seg.key}
                                                label={seg.label}
                                                desc={seg.desc}
                                                count={count}
                                                accentColor={seg.accentColor}
                                                badgeBg={seg.badgeBg}
                                                badgeText={seg.badgeText}
                                                isActive={activeSegment === seg.key}
                                                onPress={() => handleSegmentPress(seg.key as SegmentKey)}
                                            />
                                        );
                                    })}
                                </View>
                            ))}

                            {/* Spacing */}
                            <View style={{ marginBottom: 10 }} />

                            {/* Active Segment Banner */}
                            {activeSegment && activeSegmentConfig && (
                                <ActiveSegmentBanner
                                    label={activeSegmentConfig.label}
                                    count={filtered.length}
                                    onClear={() => setActiveSegment(null)}
                                />
                            )}

                            {/* Search Bars */}
                            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>Search Customers</Text>
                            <SearchBar
                                value={searchName}
                                onChangeText={setSearchName}
                                placeholder="Search by name…"
                            />
                            <SearchBar
                                value={searchPhone}
                                onChangeText={setSearchPhone}
                                placeholder="Search by phone…"
                            />
                            <SearchBar
                                value={searchEmail}
                                onChangeText={setSearchEmail}
                                placeholder="Search by email…"
                            />
                            <View style={{ marginBottom: 8 }} />

                            {/* Customer list label */}
                            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>Customers</Text>
                        </View>
                    }
                    // ── Empty State ──────────────────────────────────────────────────
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Ionicons name="people-outline" size={52} color="#D1D5DB" />
                            <Text style={[styles.emptyTitle, { color: colors.secondary }]}>
                                {activeSegment
                                    ? `No customers in "${activeSegmentConfig?.label ?? activeSegment}" segment`
                                    : "No customers found"}
                            </Text>
                        </View>
                    }
                    // ── Footer ───────────────────────────────────────────────────────
                    ListFooterComponent={
                        <View>
                            <Text style={[styles.footerText, { color: colors.secondary }]}>
                                Showing {filtered.length} of {customers.length} customers
                                {activeSegment && activeSegmentConfig
                                    ? `  ·  Segment: ${activeSegmentConfig.label}`
                                    : ""}
                            </Text>
                            {/* Bottom padding for tab bar */}
                            <View style={{ height: 100 }} />
                        </View>
                    }
                    renderItem={({ item }) => <CustomerRow customer={item} />}
                />
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
        gap: 10,
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
    refreshBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.primary + "15",
        alignItems: "center",
        justifyContent: "center",
    },

    // Loading
    loadingWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.light.secondary,
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },

    // Grids
    grid2: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },

    // Section label
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.light.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
    },

    // Empty
    emptyWrap: {
        alignItems: "center",
        paddingVertical: 48,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 14,
        color: Colors.light.secondary,
        textAlign: "center",
        lineHeight: 20,
    },

    // Footer
    footerText: {
        fontSize: 12,
        color: Colors.light.secondary,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 4,
    },
});
