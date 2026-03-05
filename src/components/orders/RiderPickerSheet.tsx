import { Colors } from '@/constants/theme';
import apiClient from '@/src/api/apiClient';
import { IRider } from '@/types/order.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RiderPickerSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (riderId: string) => void;
    loading: boolean;
}

export default function RiderPickerSheet({
    isVisible,
    onClose,
    onConfirm,
    loading,
}: RiderPickerSheetProps) {
    const [riders, setRiders] = useState<IRider[]>([]);
    const [fetchingRiders, setFetchingRiders] = useState(false);
    const [selectedRider, setSelectedRider] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            setSelectedRider(null);
            fetchRiders();
        }
    }, [isVisible]);

    const fetchRiders = async () => {
        setFetchingRiders(true);
        try {
            const res = await apiClient.get('/riders?status=AVAILABLE');
            if (res.data?.success) setRiders(res.data.data);
        } catch {
            setRiders([]);
        } finally {
            setFetchingRiders(false);
        }
    };

    return (
        <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.dismiss} onPress={onClose} />
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Assign Rider</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    {/* Riders List */}
                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {fetchingRiders ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Finding available riders…</Text>
                            </View>
                        ) : riders.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyText}>🚴 No available riders right now.</Text>
                            </View>
                        ) : (
                            riders.map((rider) => (
                                <TouchableOpacity
                                    key={rider.id}
                                    onPress={() => setSelectedRider(rider.id)}
                                    style={[
                                        styles.riderRow,
                                        selectedRider === rider.id && styles.riderRowActive,
                                    ]}
                                >
                                    <View style={[
                                        styles.radio,
                                        selectedRider === rider.id && styles.radioActive,
                                    ]}>
                                        {selectedRider === rider.id && <View style={styles.radioInner} />}
                                    </View>
                                    <View style={styles.riderAvatar}>
                                        <Text style={styles.riderInitial}>{rider.name[0]}</Text>
                                    </View>
                                    <View style={styles.riderInfo}>
                                        <Text style={styles.riderName}>{rider.name}</Text>
                                        <Text style={styles.riderPhone}>📞 {rider.phone}</Text>
                                    </View>
                                    <View style={styles.availBadge}>
                                        <Text style={styles.availText}>Available</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                    {/* Confirm Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={() => selectedRider && onConfirm(selectedRider)}
                            disabled={!selectedRider || loading}
                            style={[
                                styles.confirmBtn,
                                (!selectedRider || loading) && styles.confirmBtnDisabled,
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="bicycle" size={18} color="#fff" />
                                    <Text style={styles.confirmText}>Assign & Send for Delivery</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dismiss: { flex: 1 },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: 360,
        maxHeight: '75%',
        paddingBottom: 34,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    closeBtn: { padding: 4 },
    divider: { height: 1, backgroundColor: '#f3f4f6', marginBottom: 8 },
    body: { paddingHorizontal: 20 },
    loadingWrap: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: { color: '#6B7280', fontSize: 14 },
    emptyWrap: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#6B7280' },
    riderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        marginBottom: 10,
        gap: 12,
        backgroundColor: '#fafafa',
    },
    riderRowActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '08',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: { borderColor: Colors.primary },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    riderAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    riderInitial: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.primary,
    },
    riderInfo: { flex: 1 },
    riderName: { fontSize: 14, fontWeight: '700', color: '#111827' },
    riderPhone: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    availBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    availText: { fontSize: 10, fontWeight: '700', color: '#059669' },
    footer: { paddingHorizontal: 20, paddingTop: 12 },
    confirmBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    confirmBtnDisabled: { opacity: 0.5 },
    confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
