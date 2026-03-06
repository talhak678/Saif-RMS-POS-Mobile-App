import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IIngredient } from '@/types/ingredient.types';
import { IRecipeGroup } from '@/types/recipe.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import IngredientPicker from './IngredientPicker';

interface Props {
    dish: IRecipeGroup;
    onSubmit: (ingredientId: string, quantity: number) => Promise<void>;
    onClose: () => void;
}

export default function AddRecipeIngredientSheet({ dish, onSubmit, onClose }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [selectedIng, setSelectedIng] = useState<IIngredient | null>(null);
    const [quantity, setQuantity] = useState('');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedIng) {
            setError('Please select an ingredient');
            return;
        }
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(selectedIng.id, qty);
        } catch {
            setError('Failed to add to recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={[s.title, { color: C.text[scheme] }]}>Add Recipe Ingredient</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <View style={s.body}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Dish</Text>
                <View style={[s.readOnly, { backgroundColor: C.inputBg[scheme] }]}>
                    <Text style={[s.readOnlyText, { color: C.secondary[scheme] }]}>{dish.menuItemName}</Text>
                </View>

                <Text style={[s.label, { color: C.text[scheme], marginTop: 16 }]}>Ingredient *</Text>
                <TouchableOpacity
                    style={[s.pickerBtn, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}
                    onPress={() => setPickerVisible(true)}
                >
                    <Text style={{ color: selectedIng ? C.text[scheme] : C.secondary[scheme], fontWeight: '600' }}>
                        {selectedIng ? selectedIng.name : 'Select ingredient ▼'}
                    </Text>
                    {selectedIng && <Text style={[s.unitLabel, { color: C.secondary[scheme] }]}>({selectedIng.unit})</Text>}
                </TouchableOpacity>

                <Text style={[s.label, { color: C.text[scheme], marginTop: 16 }]}>Quantity *</Text>
                <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={quantity}
                        onChangeText={v => {
                            setQuantity(v);
                            setError(null);
                        }}
                        placeholder="e.g. 0.25"
                        placeholderTextColor={C.secondary[scheme]}
                        keyboardType="numeric"
                    />
                    {selectedIng && <Text style={[s.inputUnit, { color: C.secondary[scheme] }]}>{selectedIng.unit}</Text>}
                </View>

                {error && <Text style={s.error}>{error}</Text>}

                <TouchableOpacity
                    style={[s.submitBtn, { backgroundColor: C.primary[scheme] }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Add to Recipe</Text>}
                </TouchableOpacity>
            </View>

            <IngredientPicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={ing => {
                    setSelectedIng(ing);
                    setPickerVisible(false);
                    setError(null);
                }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800' },
    divider: { height: 1, backgroundColor: '#0001', marginBottom: 20 },
    body: { gap: 6 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    readOnly: { height: 48, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 14 },
    readOnlyText: { fontSize: 14, fontWeight: '600' },
    pickerBtn: { height: 48, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
    unitLabel: { fontSize: 12, fontWeight: '700' },
    inputWrap: { height: 48, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
    input: { flex: 1, fontSize: 14, fontWeight: '700' },
    inputUnit: { fontSize: 13, fontWeight: '800' },
    error: { color: '#ef4444', fontSize: 12, fontWeight: '700', marginTop: 8 },
    submitBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
