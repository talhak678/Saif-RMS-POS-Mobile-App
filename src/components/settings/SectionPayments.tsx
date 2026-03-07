import apiClient from '@/src/api/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IPaymentTransaction } from '@/types/settings.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function SectionPayments() {
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [payments, setPayments] = useState<IPaymentTransaction[]>([]);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const res = await apiClient.get('/payments');
            if (res.data?.success) {
                // The API returns { success: true, data: { payments: [...], pagination: {...} } }
                setPayments(res.data.data.payments || []);
            }
        } catch (err) {
            console.error('Failed to fetch payments:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColors = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PAID': return { bg: '#d1fae5', text: '#065f46' };
            case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
            case 'FAILED': return { bg: '#fee2e2', text: '#b91c1c' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    const renderItem = ({ item }: { item: IPaymentTransaction }) => {
        const { bg, text } = getStatusColors(item.status);
        return (
            <View style={[s.card, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                <View style={s.cardTop}>
                    <View style={[s.iconBox, { backgroundColor: C.primary[scheme] + '15' }]}>
                        <Ionicons name="receipt-outline" size={20} color={C.primary[scheme]} />
                    </View>
                    <View style={s.cardInfo}>
                        <Text style={[s.orderNum, { color: C.text[scheme] }]}>Order #{item.order?.orderNo || 'N/A'}</Text>
                        <Text style={[s.date, { color: C.secondary[scheme] }]}>
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                    <View style={s.amountWrap}>
                        <Text style={[s.amount, { color: C.text[scheme] }]}>$ {parseFloat(String(item.amount)).toLocaleString()}</Text>
                        <View style={[s.badge, { backgroundColor: bg }]}>
                            <Text style={[s.badgeText, { color: text }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />
                <View style={s.cardBottom}>
                    <Text style={[s.methodLabel, { color: C.secondary[scheme] }]}>Method: <Text style={{ color: C.text[scheme] }}>{item.method}</Text></Text>
                    {item.order?.customer?.name && (
                        <Text style={[s.methodValue, { color: C.secondary[scheme] }]}>By: <Text style={{ color: C.text[scheme] }}>{item.order.customer.name}</Text></Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} color={C.primary[scheme]} />;

    return (
        <FlatList
            data={payments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => fetchPayments(true)}
                    tintColor={C.primary[scheme]}
                />
            }
            ListEmptyComponent={
                <View style={s.empty}>
                    <Ionicons name="receipt-outline" size={48} color={C.secondary[scheme] + '50'} />
                    <Text style={[s.emptyText, { color: C.secondary[scheme] }]}>No transaction history found</Text>
                </View>
            }
        />
    );
}

const s = StyleSheet.create({
    list: { padding: 16 },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: { flex: 1 },
    orderNum: { fontSize: 15, fontWeight: '700' },
    date: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    amountWrap: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    divider: { height: 1, marginBottom: 12 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    methodLabel: { fontSize: 12, fontWeight: '600' },
    methodValue: { fontSize: 12, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 100, gap: 10 },
    emptyText: { fontSize: 14, fontWeight: '600' },
});
