import apiClient from '@/src/api/apiClient';
import RiderCard from '@/src/components/riders/RiderCard';
import RiderDetailSheet from '@/src/components/riders/RiderDetailSheet';
import RiderFormSheet from '@/src/components/riders/RiderFormSheet';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRider, IRiderForm, RiderStatus } from '@/types/rider.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const STATUS_FILTERS: (RiderStatus | 'ALL')[] = ['ALL', 'AVAILABLE', 'BUSY', 'OFFLINE'];

export default function RidersScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [riders, setRiders] = useState<IRider[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<RiderStatus | 'ALL'>('ALL');

    // Sheet states
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [editingRider, setEditingRider] = useState<IRider | null>(null);
    const [selectedRider, setSelectedRider] = useState<IRider | null>(null);

    const fetchRiders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
            const res = await apiClient.get(`/riders${query}`);
            if (res.data?.success) {
                setRiders(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch riders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRiders();
    }, [fetchRiders]);

    const handleCreate = async (form: IRiderForm) => {
        try {
            const res = await apiClient.post('/riders', form);
            if (res.data?.success) {
                fetchRiders(true);
                setFormVisible(false);
            }
        } catch {
            Alert.alert('Error', 'Failed to add rider');
        }
    };

    const handleUpdate = async (form: IRiderForm) => {
        if (!editingRider) return;
        try {
            const res = await apiClient.put(`/riders/${editingRider.id}`, {
                ...form,
                restaurantId: editingRider.restaurantId
            });
            if (res.data?.success) {
                fetchRiders(true);
                setFormVisible(false);
                setEditingRider(null);
            }
        } catch {
            Alert.alert('Error', 'Failed to update rider');
        }
    };

    const handleToggleStatus = async (rider: IRider) => {
        if (rider.status === 'OFFLINE') return;

        const newStatus: RiderStatus = rider.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';

        try {
            const res = await apiClient.put(`/riders/${rider.id}`, {
                name: rider.name,
                phone: rider.phone,
                status: newStatus,
                restaurantId: rider.restaurantId
            });
            if (res.data?.success) {
                fetchRiders(true);
            }
        } catch {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleDelete = (rider: IRider) => {
        Alert.alert(
            'Delete Rider',
            `Are you sure you want to delete "${rider.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/riders/${rider.id}`);
                            fetchRiders(true);
                            setDetailVisible(false);
                        } catch {
                            Alert.alert('Error', 'Failed to delete rider');
                        }
                    }
                },
            ]
        );
    };

    const openAddForm = () => {
        setEditingRider(null);
        setFormVisible(true);
    };

    const openEditForm = (rider: IRider) => {
        setEditingRider(rider);
        setDetailVisible(false);
        setFormVisible(true);
    };

    const openDetail = (rider: IRider) => {
        setSelectedRider(rider);
        setDetailVisible(true);
    };

    return (
        <View style={[s.root, { backgroundColor: C.screenBg[scheme] }]}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}
                >
                    <Ionicons name="arrow-back" size={20} color={C.text[scheme]} />
                </TouchableOpacity>

                <View style={s.titleBox}>
                    <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Riders Management</Text>
                    <View style={[s.badge, { backgroundColor: C.primary[scheme] + '20' }]}>
                        <Text style={[s.badgeText, { color: C.primary[scheme] }]}>{riders.length}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={openAddForm}
                    style={[s.addBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    <Ionicons name="person-add" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ── Status Filters ────────────────────────────────────────────────── */}
            <View style={s.filterWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
                    {STATUS_FILTERS.map(filter => {
                        const isActive = statusFilter === filter;
                        return (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => setStatusFilter(filter)}
                                style={[
                                    s.filterChip,
                                    {
                                        backgroundColor: isActive ? C.primary[scheme] : C.cardBg[scheme],
                                        borderColor: isActive ? C.primary[scheme] : C.border[scheme]
                                    }
                                ]}
                            >
                                <Text style={[
                                    s.filterText,
                                    { color: isActive ? '#fff' : C.text[scheme] }
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── List ───────────────────────────────────────────────────────────── */}
            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.primary[scheme]} />
                </View>
            ) : (
                <FlatList
                    data={riders}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchRiders(true)}
                            tintColor={C.primary[scheme]}
                            colors={[C.primary[scheme]]}
                        />
                    }
                    renderItem={({ item }) => (
                        <RiderCard
                            rider={item}
                            onToggleStatus={handleToggleStatus}
                            onView={openDetail}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <Ionicons name="bicycle-outline" size={56} color={C.secondary[scheme] + '50'} />
                            <Text style={[s.emptyTitle, { color: C.text[scheme] }]}>No riders found</Text>
                            <Text style={[s.emptySub, { color: C.secondary[scheme] }]}>
                                {statusFilter === 'ALL'
                                    ? "You haven't added any riders yet. Tap the button above to start."
                                    : `No riders currently matching the "${statusFilter}" status.`}
                            </Text>
                            {statusFilter === 'ALL' && (
                                <TouchableOpacity
                                    onPress={openAddForm}
                                    style={[s.emptyBtn, { backgroundColor: C.primary[scheme] }]}
                                >
                                    <Text style={s.emptyBtnText}>+ Add New Rider</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* ── Form Modal ── */}
            <Modal visible={formVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setFormVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        <RiderFormSheet
                            title={editingRider ? "Edit Rider" : "Add Rider"}
                            submitLabel={editingRider ? "Save Changes" : "Create Rider"}
                            initial={editingRider ? { name: editingRider.name, phone: editingRider.phone, status: editingRider.status } : undefined}
                            onClose={() => setFormVisible(false)}
                            onSubmit={editingRider ? handleUpdate : handleCreate}
                        />
                    </View>
                </View>
            </Modal>

            {/* ── Detail Modal ── */}
            <Modal visible={detailVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setDetailVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        {selectedRider && (
                            <RiderDetailSheet
                                rider={selectedRider}
                                onClose={() => setDetailVisible(false)}
                                onEdit={openEditForm}
                                onDelete={handleDelete}
                            />
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? 40 : 52,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    titleBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    addBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterWrap: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 10,
    },
    filterChip: {
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '800',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: "800" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
    emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
    },
});
