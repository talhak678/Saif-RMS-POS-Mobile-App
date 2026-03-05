import { Colors } from '@/constants/theme';
import apiClient from '@/src/api/apiClient';
import QuickActionButton from '@/src/components/orders/QuickActionButton';
import StatusPill from '@/src/components/orders/StatusPill';
import TypePill from '@/src/components/orders/TypePill';
import { useTheme } from '@/src/context/ThemeContext';
import { IOrder, STATUS_CONFIG } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
    order: IOrder;
    onRiderNeeded: (order: IOrder) => void;
    onRefresh: () => void;
    onViewDetail: (order: IOrder) => void;
}

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export default function OrderCard({ order, onRiderNeeded, onRefresh, onViewDetail }: OrderCardProps) {
    const { colors, isDark } = useTheme();
    const [actioning, setActioning] = useState(false);
    const cfg = STATUS_CONFIG[order.status];

    const pulseAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (order.status === 'PENDING') {
            const loop = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
            ]));
            loop.start();
            return () => loop.stop();
        }
        pulseAnim.setValue(0);
    }, [order.status]);

    const borderLeftColor = order.status === 'PENDING'
        ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: ['#f59e0b', '#fde68a'] })
        : (cfg.dotColor as any);

    const timeStr = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const handleQuickAction = async () => {
        const nextStatus = cfg.nextStatus;
        if (!nextStatus) return;
        if (nextStatus === 'OUT_FOR_DELIVERY') { onRiderNeeded(order); return; }
        setActioning(true);
        try {
            const body: any = { status: nextStatus };
            if (nextStatus === 'DELIVERED') body.paymentStatus = 'PAID';
            await apiClient.put(`/orders/${order.id}`, body);
            onRefresh();
        } catch { }
        finally { setActioning(false); }
    };

    const cardBg = isDark ? colors.card : '#ffffff';
    const borderColor = isDark ? colors.border : '#F3F4F6';
    const trackBg = isDark ? colors.border : '#F9FAFB';
    const iconBg = Colors.primary + (isDark ? '20' : '12');

    return (
        <Animated.View style={[s.card, { backgroundColor: cardBg, borderColor, borderLeftColor }]}>
            {/* Top */}
            <View style={s.topRow}>
                <View>
                    <Text style={[s.orderNo, { color: colors.text }]}>#{order.orderNo}</Text>
                    <View style={s.timeLine}>
                        <Ionicons name="time-outline" size={12} color={colors.secondary} />
                        <Text style={[s.timeText, { color: colors.secondary }]}>{timeStr}  ·  {timeAgo(order.createdAt)}</Text>
                    </View>
                </View>
                <TypePill type={order.type} />
            </View>

            <View style={[s.divider, { backgroundColor: borderColor }]} />

            {/* Customer & Info */}
            <View style={s.infoSection}>
                <View style={s.infoRow}>
                    <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                        <Ionicons name="person-outline" size={13} color={Colors.primary} />
                    </View>
                    <Text style={[s.infoMain, { color: colors.text }]}>{order.customer?.name ?? 'Guest'}</Text>
                    {order.customer?.phone && <Text style={[s.infoSub, { color: colors.secondary }]}>  {order.customer.phone}</Text>}
                </View>
                {order.deliveryAddress && (
                    <View style={s.infoRow}>
                        <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                            <Ionicons name="location-outline" size={13} color={Colors.primary} />
                        </View>
                        <Text style={[s.infoSubFull, { color: colors.secondary }]} numberOfLines={2}>{order.deliveryAddress}</Text>
                    </View>
                )}
                {order.tableNumber && (
                    <View style={s.infoRow}>
                        <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                            <Ionicons name="grid-outline" size={13} color={Colors.primary} />
                        </View>
                        <Text style={[s.infoSub, { color: colors.secondary }]}>Table {order.tableNumber}</Text>
                    </View>
                )}
                {order.branch?.name && (
                    <View style={s.infoRow}>
                        <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
                            <Ionicons name="storefront-outline" size={13} color={Colors.primary} />
                        </View>
                        <Text style={[s.infoSub, { color: colors.secondary }]}>{order.branch.name}</Text>
                    </View>
                )}
            </View>

            <View style={[s.divider, { backgroundColor: borderColor }]} />

            {/* Items */}
            <View style={s.itemsSection}>
                {order.items.map((item, i) => {
                    const extras: string[] = [];
                    if (item.variation?.name) extras.push(item.variation.name);
                    if (item.addons?.length) extras.push(...item.addons.map(a => a.name));
                    return (
                        <View key={item.id ?? i} style={s.itemRow}>
                            <Ionicons name="chevron-forward" size={11} color={colors.secondary} style={{ marginTop: 2 }} />
                            <View style={s.itemInfo}>
                                <Text style={[s.itemName, { color: colors.text }]}>
                                    {item.menuItem?.name ?? 'Item'}
                                    <Text style={[s.itemQty, { color: colors.secondary }]}> × {item.quantity}</Text>
                                    <Text style={s.itemPrice}>  ${(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                                </Text>
                                {extras.length > 0 && <Text style={[s.itemExtras, { color: colors.secondary }]}>{extras.join(', ')}</Text>}
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={[s.divider, { backgroundColor: borderColor }]} />

            {/* Payment */}
            <View style={s.paymentRow}>
                <View style={s.payLeft}>
                    <Ionicons name="card-outline" size={14} color={colors.secondary} />
                    <Text style={[s.payMethod, { color: colors.text }]}>{order.payment?.method ?? '—'}</Text>
                    <View style={[s.payStatusBadge, {
                        backgroundColor: order.payment?.status === 'PAID'
                            ? (isDark ? '#052e16' : '#d1fae5')
                            : (isDark ? '#3b2800' : '#fef3c7'),
                    }]}>
                        <Text style={[s.payStatusText, { color: order.payment?.status === 'PAID' ? '#059669' : '#d97706' }]}>
                            {order.payment?.status ?? '—'}
                        </Text>
                    </View>
                </View>
                <Text style={[s.totalAmount, { color: colors.text }]}>${parseFloat(order.total).toFixed(2)}</Text>
            </View>

            <View style={[s.divider, { backgroundColor: borderColor }]} />

            {/* Actions */}
            <View style={s.bottomSection}>
                <StatusPill status={order.status} />
                <View style={s.actions}>
                    <QuickActionButton order={order} onPress={handleQuickAction} loading={actioning} />
                    <TouchableOpacity
                        onPress={() => onViewDetail(order)}
                        style={[s.viewBtn, { backgroundColor: trackBg, borderColor: isDark ? colors.border : '#E5E7EB' }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="eye-outline" size={16} color={colors.secondary} />
                        <Text style={[s.viewLabel, { color: colors.secondary }]}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
    orderNo: { fontSize: 16, fontWeight: '900', marginBottom: 3 },
    timeLine: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 11, fontWeight: '500' },
    divider: { height: 1, marginVertical: 10 },
    infoSection: { gap: 6 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    iconWrap: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    infoMain: { fontSize: 14, fontWeight: '700', flex: 1 },
    infoSub: { fontSize: 13, flex: 1, lineHeight: 18 },
    infoSubFull: { fontSize: 13, flex: 1, lineHeight: 18 },
    itemsSection: { gap: 6 },
    itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 13, fontWeight: '600' },
    itemQty: { fontWeight: '500' },
    itemPrice: { color: Colors.primary, fontWeight: '700' },
    itemExtras: { fontSize: 11, marginTop: 1 },
    paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    payLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    payMethod: { fontSize: 13, fontWeight: '700' },
    payStatusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    payStatusText: { fontSize: 10, fontWeight: '800' },
    totalAmount: { fontSize: 17, fontWeight: '900' },
    bottomSection: { gap: 10 },
    actions: { flexDirection: 'row', gap: 8 },
    viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 11, borderWidth: 1 },
    viewLabel: { fontSize: 13, fontWeight: '700' },
});
