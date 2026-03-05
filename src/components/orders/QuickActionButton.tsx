import { Colors } from '@/constants/theme';
import { IOrder, STATUS_CONFIG } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

interface QuickActionButtonProps {
    order: IOrder;
    onPress: () => void;
    loading?: boolean;
}

export default function QuickActionButton({
    order,
    onPress,
    loading = false,
}: QuickActionButtonProps) {
    const cfg = STATUS_CONFIG[order.status];
    if (!cfg.nextStatus) return null;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            style={[styles.btn, { backgroundColor: Colors.primary }]}
            activeOpacity={0.85}
        >
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.label}>{cfg.nextLabel}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
    },
    label: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
});
