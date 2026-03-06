import apiClient from '@/src/api/apiClient';
import AddStockSheet from '@/src/components/inventory/AddStockSheet';
import BranchChip from '@/src/components/inventory/BranchChip';
import StockRow from '@/src/components/inventory/StockRow';
import UpdateStockSheet from '@/src/components/inventory/UpdateStockSheet';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IBranch, IStock } from '@/types/stock.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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

export default function StockManagementScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [branches, setBranches] = useState<IBranch[]>([]);
    const [stocks, setStocks] = useState<IStock[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');

    const [loadingBranches, setLoadingBranches] = useState(true);
    const [loadingStocks, setLoadingStocks] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Sheet states
    const [addSheetVisible, setAddSheetVisible] = useState(false);
    const [updateSheetVisible, setUpdateSheetVisible] = useState(false);
    const [editingStock, setEditingStock] = useState<IStock | null>(null);

    const fetchBranches = useCallback(async () => {
        try {
            const res = await apiClient.get('/branches');
            if (res.data?.success) {
                setBranches(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedBranchId(res.data.data[0].id);
                }
            }
        } catch { /* silent */ }
        finally { setLoadingBranches(false); }
    }, []);

    const fetchStocks = useCallback(async (silent = false) => {
        if (!selectedBranchId) return;
        if (!silent) setLoadingStocks(true); else setRefreshing(true);
        try {
            const res = await apiClient.get(`/stocks?branchId=${selectedBranchId}`);
            if (res.data?.success) setStocks(res.data.data);
        } catch { /* silent */ }
        finally { setLoadingStocks(false); setRefreshing(false); }
    }, [selectedBranchId]);

    useEffect(() => { fetchBranches(); }, [fetchBranches]);
    useEffect(() => { fetchStocks(); }, [fetchStocks]);

    const stats = useMemo(() => {
        const lowStockCount = stocks.filter(s => s.quantity < 10).length;
        return {
            total: stocks.length,
            low: lowStockCount
        };
    }, [stocks]);

    const handleAddStock = async (ingredientId: string, quantity: number) => {
        try {
            await apiClient.post('/stocks', {
                branchId: selectedBranchId,
                ingredientId,
                quantity
            });
            fetchStocks(true);
            setAddSheetVisible(false);
        } catch { throw new Error('Failed'); }
    };

    const handleUpdateStock = async (quantity: number) => {
        if (!editingStock) return;
        try {
            await apiClient.post('/stocks', {
                branchId: selectedBranchId,
                ingredientId: editingStock.ingredientId,
                quantity
            });
            fetchStocks(true);
            setUpdateSheetVisible(false);
        } catch { throw new Error('Failed'); }
    };

    const selectedBranchName = branches.find(b => b.id === selectedBranchId)?.name || '';

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

                <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Stock Management</Text>

                <TouchableOpacity
                    onPress={() => setAddSheetVisible(true)}
                    style={[s.addBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ── Branch Selector ────────────────────────────────────────────────── */}
            <View style={s.branchBox}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.branchScroll}>
                    <View style={[s.branchIcon, { backgroundColor: C.inputBg[scheme] }]}>
                        <Ionicons name="business-outline" size={18} color={C.secondary[scheme]} />
                    </View>
                    {branches.map(branch => (
                        <BranchChip
                            key={branch.id}
                            branch={branch}
                            isActive={selectedBranchId === branch.id}
                            onPress={() => setSelectedBranchId(branch.id)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* ── Summary Stats ──────────────────────────────────────────────────── */}
            <View style={s.statsRow}>
                <View style={[s.statChip, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                    <Ionicons name="cube-outline" size={16} color={C.primary[scheme]} />
                    <Text style={[s.statText, { color: C.text[scheme] }]}>{stats.total} Ingredients</Text>
                </View>
                <View style={[s.statChip, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                    <Ionicons name="warning-outline" size={16} color="#f59e0b" />
                    <Text style={[s.statText, { color: C.text[scheme] }]}>{stats.low} Low Stock</Text>
                </View>
            </View>

            {/* ── List ───────────────────────────────────────────────────────────── */}
            {loadingStocks ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.primary[scheme]} />
                </View>
            ) : (
                <FlatList
                    data={stocks}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchStocks(true)}
                            tintColor={C.primary[scheme]}
                            colors={[C.primary[scheme]]}
                        />
                    }
                    renderItem={({ item }) => (
                        <StockRow
                            stock={item}
                            onEdit={(s) => {
                                setEditingStock(s);
                                setUpdateSheetVisible(true);
                            }}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <Ionicons name="cube-outline" size={56} color={C.secondary[scheme] + '50'} />
                            <Text style={[s.emptyTitle, { color: C.text[scheme] }]}>No stock records yet</Text>
                            <Text style={[s.emptySub, { color: C.secondary[scheme] }]}>
                                Start by adding stock for your ingredients in this branch
                            </Text>
                            <TouchableOpacity
                                onPress={() => setAddSheetVisible(true)}
                                style={[s.emptyBtn, { backgroundColor: C.primary[scheme] }]}
                            >
                                <Text style={s.emptyBtnText}>+ Add Stock</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* ── Modals ── */}
            <Modal visible={addSheetVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setAddSheetVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        <AddStockSheet
                            branchName={selectedBranchName}
                            onClose={() => setAddSheetVisible(false)}
                            onSubmit={handleAddStock}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={updateSheetVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setUpdateSheetVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        {editingStock && (
                            <UpdateStockSheet
                                stock={editingStock}
                                onClose={() => setUpdateSheetVisible(false)}
                                onSubmit={handleUpdateStock}
                            />
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, paddingTop: Platform.OS === "android" ? 40 : 52 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
    backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: "800" },
    addBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    branchBox: { paddingBottom: 12 },
    branchScroll: { paddingHorizontal: 16, alignItems: 'center' },
    branchIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 16, borderWidth: 1 },
    statText: { fontSize: 13, fontWeight: '800' },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyWrap: { alignItems: 'center', paddingVertical: 80, gap: 10, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: "800" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
    emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    dragHandle: { width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginTop: 10 },
});
