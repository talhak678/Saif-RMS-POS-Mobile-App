import { Colors } from '@/constants/theme';
import { OrderStatus, STATUS_CONFIG } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    ALL: 'list-outline',
    PENDING: 'time-outline',
    CONFIRMED: 'checkmark-circle-outline',
    PREPARING: 'flame-outline',
    KITCHEN_READY: 'restaurant-outline',
    OUT_FOR_DELIVERY: 'bicycle-outline',
    DELIVERED: 'bag-check-outline',
    CANCELLED: 'close-circle-outline',
};

interface StatusChipProps {
    status: OrderStatus | 'ALL';
    count: number;
    active: boolean;
    onPress: () => void;
}

export default function StatusChip({ status, count, active, onPress }: StatusChipProps) {
    const label = status === 'ALL' ? 'All' : STATUS_CONFIG[status as OrderStatus].label;
    const dotColor =
        status !== 'ALL' && count > 0
            ? STATUS_CONFIG[status as OrderStatus].dotColor
            : Colors.primary;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.chip, active && styles.chipActive]}
        >
            <Ionicons
                name={STATUS_ICONS[status] ?? 'ellipse-outline'}
                size={14}
                color={active ? '#fff' : '#6B7280'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            {count > 0 && (
                <View style={[styles.badge, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : Colors.primary + '18' }]}>
                    <Text style={[styles.badgeText, { color: active ? '#fff' : Colors.primary }]}>
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    labelActive: {
        color: '#fff',
        fontWeight: '700',
    },
    badge: {
        minWidth: 19,
        height: 19,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
});
