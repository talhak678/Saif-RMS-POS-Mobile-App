import apiClient from '@/src/api/apiClient';
import IngredientForm from '@/src/components/inventory/IngredientForm';
import IngredientRow from '@/src/components/inventory/IngredientRow';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IIngredient, IIngredientForm } from '@/types/ingredient.types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function IngredientsScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [ingredients, setIngredients] = useState<IIngredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    // Sheet states
    const [sheetVisible, setSheetVisible] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<IIngredient | null>(null);

    const fetchIngredients = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const res = await apiClient.get('/ingredients');
            if (res.data?.success) {
                setIngredients(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch ingredients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const filtered = useMemo(() => {
        return ingredients.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [ingredients, search]);

    const handleCreate = async (form: IIngredientForm) => {
        try {
            const res = await apiClient.post('/ingredients', form);
            if (res.data?.success) {
                fetchIngredients(true);
                setSheetVisible(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add ingredient');
        }
    };

    const handleUpdate = async (form: IIngredientForm) => {
        if (!editingIngredient) return;
        try {
            const res = await apiClient.put(`/ingredients/${editingIngredient.id}`, form);
            if (res.data?.success) {
                fetchIngredients(true);
                setSheetVisible(false);
                setEditingIngredient(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update ingredient');
        }
    };

    const handleDelete = (ingredient: IIngredient) => {
        Alert.alert(
            'Delete Ingredient',
            `Delete "${ingredient.name}"? This will also remove it from all stock records and recipes.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/ingredients/${ingredient.id}`);
                            fetchIngredients(true);
                        } catch {
                            Alert.alert('Error', 'Failed to delete ingredient');
                        }
                    }
                },
            ]
        );
    };

    const openAddSheet = () => {
        setEditingIngredient(null);
        setSheetVisible(true);
    };

    const openEditSheet = (ing: IIngredient) => {
        setEditingIngredient(ing);
        setSheetVisible(true);
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
                    <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Ingredients</Text>
                    <View style={[s.badge, { backgroundColor: C.primary[scheme] + '20' }]}>
                        <Text style={[s.badgeText, { color: C.primary[scheme] }]}>{ingredients.length}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={openAddSheet}
                    style={[s.addBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ── Search ─────────────────────────────────────────────────────────── */}
            <View style={s.searchWrap}>
                <View style={[s.searchBar, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <Ionicons name="search" size={18} color={C.secondary[scheme]} />
                    <TextInput
                        style={[s.searchInput, { color: C.text[scheme] }]}
                        placeholder="Search ingredients..."
                        placeholderTextColor={C.secondary[scheme]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* ── List ───────────────────────────────────────────────────────────── */}
            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.primary[scheme]} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchIngredients(true)}
                            tintColor={C.primary[scheme]}
                            colors={[C.primary[scheme]]}
                        />
                    }
                    renderItem={({ item }) => (
                        <IngredientRow
                            ingredient={item}
                            onEdit={openEditSheet}
                            onDelete={handleDelete}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <Ionicons name="nutrition-outline" size={56} color={C.secondary[scheme] + '50'} />
                            <Text style={[s.emptyTitle, { color: C.text[scheme] }]}>No ingredients yet</Text>
                            <Text style={[s.emptySub, { color: C.secondary[scheme] }]}>
                                Add your first ingredient to start tracking inventory
                            </Text>
                            <TouchableOpacity
                                onPress={openAddSheet}
                                style={[s.emptyBtn, { backgroundColor: C.primary[scheme] }]}
                            >
                                <Text style={s.emptyBtnText}>+ Add Ingredient</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* ── Add/Edit Modal ── */}
            <Modal visible={sheetVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setSheetVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        <IngredientForm
                            title={editingIngredient ? "Edit Ingredient" : "Add Ingredient"}
                            submitLabel={editingIngredient ? "Save Changes" : "Add Ingredient"}
                            initial={editingIngredient ? { name: editingIngredient.name, unit: editingIngredient.unit } : undefined}
                            onClose={() => setSheetVisible(false)}
                            onSubmit={editingIngredient ? handleUpdate : handleCreate}
                        />
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
    searchWrap: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 44,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
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
        gap: 10,
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: "800" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
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
        minHeight: 400,
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
