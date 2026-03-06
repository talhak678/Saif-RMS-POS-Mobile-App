import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IStock } from '@/types/stock.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    stock: IStock;
    onSubmit: (quantity: number) => Promise<void>;
    onClose: () => void;
}

export default function UpdateStockSheet({ stock, onSubmit, onClose }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [quantity, setQuantity] = useState(String(stock.quantity));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty < 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(qty);
        } catch {
            setError('Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={[s.title, { color: C.text[scheme] }]}>Update Stock</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <View style={s.body}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Ingredient</Text>
                <View style={s.ingHeader}>
                    <Text style={[s.ingName, { color: C.text[scheme] }]}>{stock.ingredient.name}</Text>
                    <Text style={[s.currentQty, { color: C.secondary[scheme] }]}>
                        Current: {stock.quantity} {stock.ingredient.unit}
                    </Text>
                </View>

                <Text style={[s.label, { color: C.text[scheme], marginTop: 20 }]}>New Quantity *</Text>
                <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={quantity}
                        onChangeText={v => {
                            setQuantity(v);
                            setError(null);
                        }}
                        placeholder="0.00"
                        placeholderTextColor={C.secondary[scheme]}
                        keyboardType="numeric"
                        autoFocus
                    />
                    <Text style={[s.inputUnit, { color: C.secondary[scheme] }]}>{stock.ingredient.unit}</Text>
                </View>

                {error && <Text style={s.error}>{error}</Text>}

                <TouchableOpacity
                    style={[s.submitBtn, { backgroundColor: C.primary[scheme] }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Save Changes</Text>}
                </TouchableOpacity>
            </View>
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
    ingHeader: { gap: 2 },
    ingName: { fontSize: 16, fontWeight: '800' },
    currentQty: { fontSize: 13, fontWeight: '600' },
    inputWrap: { height: 52, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    input: { flex: 1, fontSize: 16, fontWeight: '800' },
    inputUnit: { fontSize: 14, fontWeight: '800' },
    error: { color: '#ef4444', fontSize: 12, fontWeight: '700', marginTop: 8 },
    submitBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
