import { OrderStatus, STATUS_CONFIG } from '@/types/order.types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusPillProps {
    status: OrderStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
    const cfg = STATUS_CONFIG[status];
    return (
        <View style={[styles.pill, { backgroundColor: cfg.bg }]}>
            <View style={[styles.dot, { backgroundColor: cfg.dotColor }]} />
            <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});
