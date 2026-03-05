import { Colors } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { IOrder, STATUS_CONFIG, TYPE_CONFIG } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    isVisible: boolean;
    onClose: () => void;
    order: IOrder | null;
    onUpdatePress: (order: IOrder) => void;
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(s: string) {
    return new Date(s).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function OrderDetailModal({ isVisible, onClose, order, onUpdatePress }: Props) {
    const { colors, isDark } = useTheme();
    if (!order) return null;

    const statusCfg = STATUS_CONFIG[order.status];
    const typeCfg = TYPE_CONFIG[order.type];
    const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

    const sheetBg = isDark ? colors.background : '#F9FAFB';
    const cardBg = isDark ? colors.card : '#fff';
    const dividerColor = isDark ? colors.border : '#F3F4F6';
    const itemCardBg = isDark ? colors.border : '#F9FAFB';

    function Section({ title, children }: { title: string; children: React.ReactNode }) {
        return (
            <View style={[s.section, { backgroundColor: cardBg, borderColor: dividerColor }]}>
                <Text style={[s.sectionTitle, { color: colors.secondary }]}>{title}</Text>
                {children}
            </View>
        );
    }

    function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
        if (!value) return null;
        return (
            <View style={s.infoRow}>
                <View style={[s.iconWrap, { backgroundColor: Colors.primary + '18' }]}>
                    <Ionicons name={icon} size={13} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: colors.secondary }]}>{label}</Text>
                    <Text style={[s.infoValue, { color: colors.text }]}>{value}</Text>
                </View>
            </View>
        );
    }

    return (
        <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={[s.sheet, { backgroundColor: sheetBg }]}>
                    <View style={[s.handle, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]} />

                    {/* Header */}
                    <View style={[s.header, { backgroundColor: cardBg, borderBottomColor: dividerColor }]}>
                        <View>
                            <Text style={[s.headerTitle, { color: colors.text }]}>Order #{order.orderNo}</Text>
                            <Text style={[s.headerSub, { color: colors.secondary }]}>
                                {fmtDate(order.createdAt)}  ·  {fmtTime(order.createdAt)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[s.closeBtn, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]}
                        >
                            <Ionicons name="close" size={22} color={colors.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Status Row */}
                    <View style={[s.statusRow, { backgroundColor: cardBg, borderBottomColor: dividerColor }]}>
                        <View style={[s.badge, { backgroundColor: statusCfg.bg }]}>
                            <View style={[s.dot, { backgroundColor: statusCfg.dotColor }]} />
                            <Text style={[s.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: isDark ? typeCfg.color + '22' : typeCfg.bg }]}>
                            <Ionicons
                                name={order.type === 'DELIVERY' ? 'bicycle-outline' : order.type === 'PICKUP' ? 'bag-handle-outline' : 'restaurant-outline'}
                                size={13}
                                color={typeCfg.color}
                            />
                            <Text style={[s.badgeText, { color: typeCfg.color }]}>{typeCfg.label}</Text>
                        </View>
                    </View>

                    {/* Body */}
                    <ScrollView style={s.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                        <Section title="Customer">
                            <InfoRow icon="person-outline" label="Name" value={order.customer?.name ?? 'Guest'} />
                            <InfoRow icon="call-outline" label="Phone" value={order.customer?.phone} />
                            <InfoRow icon="mail-outline" label="Email" value={order.customer?.email} />
                            <InfoRow icon="location-outline" label="Delivery Address" value={order.deliveryAddress} />
                            <InfoRow icon="grid-outline" label="Table Number" value={order.tableNumber} />
                            <InfoRow icon="storefront-outline" label="Branch" value={order.branch?.name} />
                        </Section>

                        <Section title={`Items (${totalItems})`}>
                            {order.items.map((item, i) => {
                                const extras: string[] = [];
                                if (item.variation?.name) extras.push(`Variation: ${item.variation.name}`);
                                if (item.addons?.length) extras.push(`Add-ons: ${item.addons.map(a => a.name).join(', ')}`);
                                return (
                                    <View key={item.id ?? i} style={[s.itemCard, { backgroundColor: itemCardBg, borderColor: dividerColor }]}>
                                        <View style={s.itemHeader}>
                                            <View style={[s.itemIcon, { backgroundColor: Colors.primary + '18' }]}>
                                                <Ionicons name="fast-food-outline" size={16} color={Colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[s.itemName, { color: colors.text }]} numberOfLines={2}>
                                                    {item.menuItem?.name ?? 'Item'}
                                                </Text>
                                                {extras.map((e, ei) => (
                                                    <Text key={ei} style={[s.itemExtra, { color: colors.secondary }]}>{e}</Text>
                                                ))}
                                            </View>
                                            <View style={s.itemPrices}>
                                                <Text style={[s.itemQtyText, { color: colors.secondary }]}>× {item.quantity}</Text>
                                                <Text style={s.itemTotal}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                            <View style={[s.totalRow, { borderTopColor: dividerColor }]}>
                                <Text style={[s.totalLabel, { color: colors.secondary }]}>Total</Text>
                                <Text style={[s.totalValue, { color: colors.text }]}>${parseFloat(order.total).toFixed(2)}</Text>
                            </View>
                        </Section>

                        <Section title="Payment">
                            <View style={s.payRow}>
                                <View style={s.payLeft}>
                                    <Ionicons name="card-outline" size={14} color={colors.secondary} />
                                    <Text style={[s.payMethod, { color: colors.text }]}>{order.payment?.method ?? '—'}</Text>
                                </View>
                                <View style={[s.payBadge, {
                                    backgroundColor: order.payment?.status === 'PAID'
                                        ? (isDark ? '#052e16' : '#d1fae5')
                                        : (isDark ? '#3b2800' : '#fef3c7'),
                                }]}>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: order.payment?.status === 'PAID' ? '#059669' : '#d97706' }}>
                                        {order.payment?.status ?? '—'}
                                    </Text>
                                </View>
                            </View>
                        </Section>
                    </ScrollView>

                    {/* Footer */}
                    {statusCfg.nextStatus && (
                        <View style={[s.footer, { backgroundColor: cardBg, borderTopColor: dividerColor }]}>
                            <TouchableOpacity
                                onPress={() => { onClose(); onUpdatePress(order); }}
                                style={s.updateBtn}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="refresh-outline" size={17} color="#fff" />
                                <Text style={s.updateBtnText}>Update Status</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    backdrop: { flex: 1 },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', paddingBottom: Platform.OS === 'ios' ? 30 : 0 },
    handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    headerTitle: { fontSize: 18, fontWeight: '900' },
    headerSub: { fontSize: 12, marginTop: 3, fontWeight: '500' },
    closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statusRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    badgeText: { fontSize: 12, fontWeight: '800' },
    body: { paddingHorizontal: 16, paddingTop: 14 },
    section: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    iconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
    infoValue: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
    itemCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
    itemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    itemIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    itemName: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
    itemExtra: { fontSize: 11, marginTop: 2 },
    itemPrices: { alignItems: 'flex-end', gap: 2 },
    itemQtyText: { fontSize: 11, fontWeight: '600' },
    itemTotal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTopWidth: 1 },
    totalLabel: { fontSize: 13, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '900' },
    payRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    payLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    payMethod: { fontSize: 14, fontWeight: '700' },
    payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1 },
    updateBtn: {
        backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 15, borderRadius: 16,
        shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    updateBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
