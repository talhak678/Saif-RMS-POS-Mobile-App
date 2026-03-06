import apiClient from '@/src/api/apiClient';
import AddRecipeIngredientSheet from '@/src/components/inventory/AddRecipeIngredientSheet';
import RecipeCard from '@/src/components/inventory/RecipeCard';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRecipeGroup, groupAllRecipes } from '@/types/recipe.types';
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

export default function RecipeManagementScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [groups, setGroups] = useState<IRecipeGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    // Sheet states
    const [addSheetVisible, setAddSheetVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<IRecipeGroup | null>(null);

    const fetchRecipes = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const [recipeRes, menuRes] = await Promise.all([
                apiClient.get('/recipes'),
                apiClient.get('/menu-items'),
            ]);

            if (recipeRes.data?.success && menuRes.data?.success) {
                setGroups(groupAllRecipes(menuRes.data.data, recipeRes.data.data));
            }
        } catch { /* silent */ }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

    const filtered = useMemo(() => {
        return groups.filter(g =>
            g.menuItemName.toLowerCase().includes(search.toLowerCase())
        );
    }, [groups, search]);

    const handleAddIngredient = async (ingredientId: string, quantity: number) => {
        if (!selectedGroup) return;
        try {
            await apiClient.post('/recipes', {
                menuItemId: selectedGroup.menuItemId,
                ingredientId,
                quantity
            });
            fetchRecipes(true);
            setAddSheetVisible(false);
        } catch { throw new Error('Failed'); }
    };

    const handleRemoveIngredient = (recipeItemId: string, ingredientName: string) => {
        Alert.alert(
            'Remove Ingredient',
            `Remove "${ingredientName}" from this recipe?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/recipes/${recipeItemId}`);
                            fetchRecipes(true);
                        } catch {
                            Alert.alert('Error', 'Failed to remove ingredient');
                        }
                    }
                },
            ]
        );
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

                <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Recipe Management</Text>
            </View>

            {/* ── Search ─────────────────────────────────────────────────────────── */}
            <View style={s.searchWrap}>
                <View style={[s.searchBar, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <Ionicons name="search" size={18} color={C.secondary[scheme]} />
                    <TextInput
                        style={[s.searchInput, { color: C.text[scheme] }]}
                        placeholder="Search by dish name..."
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
                    keyExtractor={item => item.menuItemId}
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchRecipes(true)}
                            tintColor={C.primary[scheme]}
                            colors={[C.primary[scheme]]}
                        />
                    }
                    renderItem={({ item }) => (
                        <RecipeCard
                            group={item}
                            onAddIngredient={(g) => {
                                setSelectedGroup(g);
                                setAddSheetVisible(true);
                            }}
                            onRemoveIngredient={handleRemoveIngredient}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={s.emptyWrap}>
                            <Ionicons name="restaurant-outline" size={56} color={C.secondary[scheme] + '50'} />
                            <Text style={[s.emptyTitle, { color: C.text[scheme] }]}>No recipes yet</Text>
                            <Text style={[s.emptySub, { color: C.secondary[scheme] }]}>
                                Define ingredient requirements for your menu items
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Add Modal ── */}
            <Modal visible={addSheetVisible} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setAddSheetVisible(false)} />
                    <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                        <View style={s.dragHandle} />
                        {selectedGroup && (
                            <AddRecipeIngredientSheet
                                dish={selectedGroup}
                                onClose={() => setAddSheetVisible(false)}
                                onSubmit={handleAddIngredient}
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
    searchWrap: { paddingHorizontal: 16, marginBottom: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44, gap: 10 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyWrap: { alignItems: 'center', paddingVertical: 80, gap: 10, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: "800" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    dragHandle: { width: 40, height: 4, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginTop: 10 },
});
