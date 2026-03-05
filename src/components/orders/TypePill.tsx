import { OrderType, TYPE_CONFIG } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TYPE_ICONS: Record<OrderType, keyof typeof Ionicons.glyphMap> = {
    DINE_IN: 'restaurant-outline',
    DELIVERY: 'bicycle-outline',
    PICKUP: 'bag-handle-outline',
};

export default function TypePill({ type }: { type: OrderType }) {
    const cfg = TYPE_CONFIG[type];
    return (
        <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
            <Ionicons name={TYPE_ICONS[type]} size={12} color={cfg.color} />
            <Text style={[styles.label, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
    },
    label: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});
