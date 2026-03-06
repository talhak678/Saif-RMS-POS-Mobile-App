import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IIngredient, getStockColor, getTotalStock } from '@/types/ingredient.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    ingredient: IIngredient;
    onEdit: (ing: IIngredient) => void;
    onDelete: (ing: IIngredient) => void;
}

export default function IngredientRow({ ingredient, onEdit, onDelete }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    const totalStock = getTotalStock(ingredient);
    const stockColor = getStockColor(totalStock);

    return (
        <View style={[s.card, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
            <View style={[s.iconBox, { backgroundColor: C.primary[scheme] + '15' }]}>
                <Ionicons name="nutrition-outline" size={24} color={C.primary[scheme]} />
            </View>

            <View style={s.center}>
                <Text style={[s.name, { color: C.text[scheme] }]}>{ingredient.name}</Text>
                <Text style={[s.unitLabel, { color: C.secondary[scheme] }]}>Unit: {ingredient.unit}</Text>

                {totalStock < 10 && totalStock > 0 && (
                    <View style={s.warningRow}>
                        <Ionicons name="warning-outline" size={12} color="#f59e0b" />
                        <Text style={s.warningText}>Low Stock</Text>
                    </View>
                )}
                {totalStock === 0 && (
                    <View style={s.warningRow}>
                        <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
                        <Text style={[s.warningText, { color: '#ef4444' }]}>Out of Stock</Text>
                    </View>
                )}
            </View>

            <View style={s.right}>
                <View style={s.stockInfo}>
                    <View style={[s.dot, { backgroundColor: stockColor }]} />
                    <Text style={[s.qtyText, { color: stockColor }]}>{totalStock} {ingredient.unit}</Text>
                </View>
                <Text style={[s.stockLabel, { color: C.secondary[scheme] }]}>Total Stock</Text>

                <View style={s.actions}>
                    <TouchableOpacity
                        onPress={() => onEdit(ingredient)}
                        style={[s.actionBtn, { backgroundColor: '#3b82f620' }]}
                    >
                        <Ionicons name="pencil" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(ingredient)}
                        style={[s.actionBtn, { backgroundColor: '#ef444420' }]}
                    >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    center: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
    },
    unitLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    warningText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#f59e0b',
    },
    right: {
        alignItems: 'flex-end',
        gap: 2,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '800',
    },
    stockLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
