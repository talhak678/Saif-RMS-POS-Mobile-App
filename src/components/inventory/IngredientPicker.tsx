import apiClient from '@/src/api/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IIngredient } from '@/types/ingredient.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    visible: boolean;
    onSelect: (ing: IIngredient) => void;
    onClose: () => void;
}

export default function IngredientPicker({ visible, onSelect, onClose }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [ingredients, setIngredients] = useState<IIngredient[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchIngredients();
        }
    }, [visible]);

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/ingredients');
            if (res.data?.success) setIngredients(res.data.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={s.overlay}>
                <View style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                    <View style={s.header}>
                        <Text style={[s.title, { color: C.text[scheme] }]}>Select Ingredient</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={C.text[scheme]} />
                        </TouchableOpacity>
                    </View>

                    <View style={[s.searchBar, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                        <Ionicons name="search" size={18} color={C.secondary[scheme]} />
                        <TextInput
                            style={[s.searchInput, { color: C.text[scheme] }]}
                            placeholder="Search..."
                            placeholderTextColor={C.secondary[scheme]}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[s.row, { borderBottomColor: C.border[scheme] }]}
                                onPress={() => onSelect(item)}
                            >
                                <View style={[s.icon, { backgroundColor: C.primary[scheme] + '10' }]}>
                                    <Ionicons name="nutrition" size={18} color={C.primary[scheme]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.ingName, { color: C.text[scheme] }]}>{item.name}</Text>
                                    <Text style={[s.ingUnit, { color: C.secondary[scheme] }]}>{item.unit}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={C.secondary[scheme]} />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800' },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, marginBottom: 16, gap: 10 },
    searchInput: { flex: 1, height: '100%', fontSize: 14, fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
    icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    ingName: { fontSize: 15, fontWeight: '700' },
    ingUnit: { fontSize: 12, marginTop: 2 },
});
