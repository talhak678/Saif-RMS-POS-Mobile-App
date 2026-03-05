import { Colors } from '@/constants/theme';
import apiClient from '@/src/api/apiClient';
import OrderCard from '@/src/components/orders/OrderCard';
import OrderDetailModal from '@/src/components/orders/OrderDetailModal';
import RiderPickerSheet from '@/src/components/orders/RiderPickerSheet';
import StatusChip from '@/src/components/orders/StatusChip';
import StatusUpdateSheet from '@/src/components/orders/StatusUpdateSheet';
import { useTheme } from '@/src/context/ThemeContext';
import { IOrder, OrderStatus } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ALL_STATUS_FILTERS: (OrderStatus | 'ALL')[] = [
    'ALL', 'PENDING', 'CONFIRMED', 'PREPARING',
    'KITCHEN_READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

export default function IncomingOrdersScreen() {
    const { colors, isDark } = useTheme();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

    // Branch filter
    const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
    const [branchFilter, setBranchFilter] = useState<string>('ALL');
    const [showBranches, setShowBranches] = useState(false);

    // Last updated counter
    const [lastUpdatedSec, setLastUpdatedSec] = useState(0);
    const lastUpdatedRef = useRef(0);

    // Sound
    const soundRef = useRef<Audio.Sound | null>(null);
    const [muted, setMuted] = useState(false);

    // Sheets & modals
    const [riderOrder, setRiderOrder] = useState<IOrder | null>(null);
    const [assigningRider, setAssigning] = useState(false);
    const [detailOrder, setDetailOrder] = useState<IOrder | null>(null);
    const [updateOrder, setUpdateOrder] = useState<IOrder | null>(null);

    // ── Fetch branches ─────────────────────────────────────────────────────────
    useEffect(() => {
        apiClient.get('/branches').then(res => {
            if (res.data?.success) setBranches(res.data.data);
        }).catch(() => { });
    }, []);

    // ── Fetch orders ───────────────────────────────────────────────────────────
    // Helper: YYYY-MM-DD string for a date offset by N days from today
    const dateStr = (offsetDays: number) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().split('T')[0];
    };

    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (branchFilter !== 'ALL') params.branchId = branchFilter;
            // Default: only last 2 days
            params.startDate = dateStr(-2);
            params.endDate = dateStr(0);
            const res = await apiClient.get('/orders', { params });
            if (res.data?.success) {
                setOrders(res.data.data);
                lastUpdatedRef.current = 0;
                setLastUpdatedSec(0);
            }
        } catch { /* silent */ }
        finally { setLoading(false); setRefreshing(false); }
    }, [statusFilter, branchFilter]);

    // ── 30-second polling ──────────────────────────────────────────────────────
    useEffect(() => {
        fetchOrders();
        const poll = setInterval(() => fetchOrders(true), 30000);
        return () => clearInterval(poll);
    }, [fetchOrders]);

    // ── "Last updated" counter ─────────────────────────────────────────────────
    useEffect(() => {
        const t = setInterval(() => {
            lastUpdatedRef.current += 1;
            setLastUpdatedSec(lastUpdatedRef.current);
        }, 1000);
        return () => clearInterval(t);
    }, []);

    // ── Sound ─────────────────────────────────────────────────────────────────
    const stopBell = useCallback(async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch { }
            soundRef.current = null;
        }
    }, []);

    const playBell = useCallback(async () => {
        if (muted || soundRef.current) return;
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('@/assets/sounds/bell.wav'),
                { isLooping: true, volume: 0.7 }
            );
            soundRef.current = sound;
            await sound.playAsync();
        } catch { /* bell.wav missing — silently skip */ }
    }, [muted]);

    useEffect(() => {
        const hasPending = orders.some(o => o.status === 'PENDING');
        if (hasPending && !muted) playBell();
        else stopBell();
    }, [orders, muted]);

    useEffect(() => () => { stopBell(); }, []);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const countByStatus = (s: OrderStatus | 'ALL') =>
        s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;

    const displayed = statusFilter === 'ALL'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    const lastUpdatedLabel = lastUpdatedSec < 60
        ? `${lastUpdatedSec}s ago`
        : `${Math.floor(lastUpdatedSec / 60)}m ${lastUpdatedSec % 60}s ago`;

    // ── Rider assign ───────────────────────────────────────────────────────────
    const handleRiderConfirm = async (riderId: string) => {
        if (!riderOrder) return;
        setAssigning(true);
        try {
            await apiClient.put(`/orders/${riderOrder.id}`, {
                status: 'OUT_FOR_DELIVERY',
                paymentStatus: 'PENDING',
                riderId,
            });
            setRiderOrder(null);
            fetchOrders(true);
        } catch { /* silent */ }
        finally { setAssigning(false); }
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>

            {/* ── Header ── */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Ionicons name="chevron-back" size={22} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.titleWrap}>
                        <Text style={[styles.title, { color: colors.text }]}>Incoming Orders</Text>
                        {pendingCount > 0 && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setMuted(m => !m)} style={styles.iconBtn}>
                            <Ionicons
                                name={muted ? 'volume-mute-outline' : 'volume-high-outline'}
                                size={20}
                                color={muted ? colors.secondary : Colors.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setRefreshing(true); fetchOrders(true); }} style={styles.iconBtn}>
                            <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.lastUpdated, { color: colors.secondary }]}>
                    Last updated: {lastUpdatedLabel}
                </Text>
            </View>

            {/* ── Status Filter Chips ── */}
            <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                    {ALL_STATUS_FILTERS.map(s => (
                        <StatusChip key={s} status={s} count={countByStatus(s)} active={statusFilter === s} onPress={() => setStatusFilter(s)} />
                    ))}
                </ScrollView>
            </View>

            {/* ── Branch Filter ── */}
            {branches.length > 0 && (
                <View style={[styles.branchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }, showBranches && { zIndex: 20 }]}>
                    <View style={styles.branchLabelWrap}>
                        <Ionicons name="storefront-outline" size={14} color={Colors.primary} />
                        <Text style={[styles.branchLabel, { color: colors.text }]}>Branch:</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowBranches(v => !v)}
                        style={[styles.branchPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.branchPickerText, { color: colors.text }]} numberOfLines={1}>
                            {branchFilter === 'ALL' ? 'All Branches' : branches.find(b => b.id === branchFilter)?.name ?? 'Selected'}
                        </Text>
                        <Ionicons name="chevron-down-outline" size={14} color={colors.secondary} />
                    </TouchableOpacity>

                    {showBranches && (
                        <View style={[styles.branchDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TouchableOpacity style={[styles.branchOption, { borderBottomColor: colors.border }]}
                                onPress={() => { setBranchFilter('ALL'); setShowBranches(false); }}>
                                <Text style={[styles.branchOptionText, { color: colors.text }, branchFilter === 'ALL' && { color: Colors.primary }]}>All Branches</Text>
                                {branchFilter === 'ALL' && <Ionicons name="checkmark" size={14} color={Colors.primary} />}
                            </TouchableOpacity>
                            {branches.map(b => (
                                <TouchableOpacity key={b.id} style={[styles.branchOption, { borderBottomColor: colors.border }]}
                                    onPress={() => { setBranchFilter(b.id); setShowBranches(false); }}>
                                    <Text style={[styles.branchOptionText, { color: colors.text }, branchFilter === b.id && { color: Colors.primary }]}>{b.name}</Text>
                                    {branchFilter === b.id && <Ionicons name="checkmark" size={14} color={Colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* ── Content ── */}
            {loading && !refreshing ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loaderText, { color: colors.secondary }]}>Fetching live orders…</Text>
                </View>
            ) : (
                <FlatList
                    data={displayed}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(true); }}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    }
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onRiderNeeded={o => setRiderOrder(o)}
                            onRefresh={() => fetchOrders(true)}
                            onViewDetail={o => setDetailOrder(o)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]}>
                                <Ionicons name="receipt-outline" size={44} color="#D1D5DB" />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders right now</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>Auto-refreshes every 30 seconds</Text>
                            <TouchableOpacity onPress={() => fetchOrders(true)} style={styles.refreshBtn}>
                                <Ionicons name="refresh-outline" size={16} color="#fff" />
                                <Text style={styles.refreshBtnText}>Refresh Now</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />
            )}

            <OrderDetailModal isVisible={!!detailOrder} onClose={() => setDetailOrder(null)} order={detailOrder} onUpdatePress={o => setUpdateOrder(o)} />
            <StatusUpdateSheet isVisible={!!updateOrder} onClose={() => setUpdateOrder(null)} order={updateOrder} onSuccess={() => fetchOrders(true)} />
            <RiderPickerSheet isVisible={!!riderOrder} onClose={() => setRiderOrder(null)} onConfirm={handleRiderConfirm} loading={assigningRider} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },

    // ── Header ──
    header: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 40 : 54,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.light.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    titleWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.light.text,
    },
    pendingBadge: {
        backgroundColor: '#EF4444',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    },
    pendingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    headerActions: { flexDirection: 'row', gap: 8 },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lastUpdated: {
        fontSize: 11,
        color: Colors.light.secondary,
        fontWeight: '500',
    },

    // ── Filter chips ──
    filterBar: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    chipScroll: { paddingHorizontal: 16 },

    // ── Branch Row ──
    branchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        gap: 8,
        position: 'relative',
        zIndex: 10,
    },
    branchLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    branchLabel: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
    branchPicker: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.light.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    branchPickerText: { fontSize: 13, fontWeight: '600', color: Colors.light.text, flex: 1 },
    branchDropdown: {
        position: 'absolute',
        top: 52,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        zIndex: 100,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
    },
    branchOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    branchOptionText: { fontSize: 14, fontWeight: '600', color: '#374151' },
    branchOptionActive: { color: Colors.primary },

    // ── Loader / Empty ──
    loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loaderText: { fontSize: 14, color: Colors.light.secondary },

    listContent: { padding: 16, paddingTop: 14 },

    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 90,
        paddingHorizontal: 40,
        gap: 10,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
    emptySubtitle: { fontSize: 13, color: Colors.light.secondary, textAlign: 'center' },
    refreshBtn: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 22,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
        borderRadius: 14,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    refreshBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
