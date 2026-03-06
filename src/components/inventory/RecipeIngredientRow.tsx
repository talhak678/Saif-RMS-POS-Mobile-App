import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRecipeItem } from '@/types/recipe.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    item: IRecipeItem;
    onRemove: (id: string, name: string) => void;
}

export default function RecipeIngredientRow({ item, onRemove }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    return (
        <View style={[s.row, { borderBottomColor: C.border[scheme] + '50' }]}>
            <View style={[s.iconBox, { backgroundColor: C.primary[scheme] + '10' }]}>
                <Ionicons name="cube-outline" size={14} color={C.primary[scheme]} />
            </View>

            <Text style={[s.name, { color: C.text[scheme] }]}>{item.ingredient.name}</Text>

            <Text style={[s.qty, { color: C.primary[scheme] }]}>
                {item.quantity} {item.ingredient.unit}
            </Text>

            <TouchableOpacity
                onPress={() => onRemove(item.id, item.ingredient.name)}
                style={[s.deleteBtn, { backgroundColor: '#ef444415' }]}
            >
                <Ionicons name="trash" size={14} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    qty: {
        fontSize: 14,
        fontWeight: '900',
    },
    deleteBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
