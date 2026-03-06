import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IStock, getStockStatus } from '@/types/stock.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    stock: IStock;
    onEdit: (stock: IStock) => void;
}

export default function StockRow({ stock, onEdit }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    const status = getStockStatus(stock.quantity);

    return (
        <View style={[
            s.card,
            {
                backgroundColor: C.cardBg[scheme],
                borderColor: C.border[scheme],
                borderLeftColor: status.color
            }
        ]}>
            <View style={[s.iconBox, { backgroundColor: status.color + '10' }]}>
                <Ionicons name="cube-outline" size={22} color={status.color} />
            </View>

            <View style={s.center}>
                <Text style={[s.name, { color: C.text[scheme] }]}>{stock.ingredient.name}</Text>
                <Text style={[s.subline, { color: C.secondary[scheme] }]}>
                    Unit: {stock.ingredient.unit}  •  Updated {new Date(stock.updatedAt).toLocaleDateString()}
                </Text>
            </View>

            <View style={s.right}>
                <View style={s.qtyBox}>
                    <Text style={[s.qtyText, { color: status.color }]}>{stock.quantity}</Text>
                    <Text style={[s.unitSmall, { color: C.secondary[scheme] }]}>{stock.ingredient.unit}</Text>
                </View>

                <View style={[s.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[s.statusLabel, { color: status.color }]}>{status.label}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => onEdit(stock)}
                    style={[s.editBtn, { backgroundColor: C.primary[scheme] + '15' }]}
                >
                    <Ionicons name="pencil" size={14} color={C.primary[scheme]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: 1,
        borderLeftWidth: 4,
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
    subline: {
        fontSize: 11,
        marginTop: 4,
    },
    right: {
        alignItems: 'flex-end',
        gap: 4,
    },
    qtyBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    qtyText: {
        fontSize: 18,
        fontWeight: '900',
    },
    unitSmall: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '800',
    },
    editBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
});
