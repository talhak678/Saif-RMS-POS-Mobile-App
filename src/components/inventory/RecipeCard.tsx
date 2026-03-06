import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRecipeGroup } from '@/types/recipe.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecipeIngredientRow from './RecipeIngredientRow';

interface Props {
    group: IRecipeGroup;
    onAddIngredient: (group: IRecipeGroup) => void;
    onRemoveIngredient: (ingredientId: string, ingredientName: string) => void;
}

export default function RecipeCard({ group, onAddIngredient, onRemoveIngredient }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    return (
        <View style={[s.card, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
            <View style={s.top}>
                {group.menuItemImage ? (
                    <Image source={{ uri: group.menuItemImage }} style={s.image} resizeMode="cover" />
                ) : (
                    <View style={[s.imagePlaceholder, { backgroundColor: C.inputBg[scheme] }]}>
                        <Ionicons name="fast-food-outline" size={32} color={C.secondary[scheme]} />
                    </View>
                )}

                <View style={s.info}>
                    <Text style={[s.name, { color: C.text[scheme] }]}>{group.menuItemName}</Text>
                    <Text style={[s.price, { color: C.primary[scheme] }]}>${group.menuItemPrice}</Text>
                    <View style={[s.badge, { backgroundColor: C.secondary[scheme] + '15' }]}>
                        <Text style={[s.badgeText, { color: C.secondary[scheme] }]}>{group.ingredients.length} ingredients</Text>
                    </View>
                </View>
            </View>

            <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

            <View style={s.ingredientsSection}>
                <Text style={[s.sectionLabel, { color: C.secondary[scheme] }]}>INGREDIENTS</Text>

                {group.ingredients.length === 0 ? (
                    <View style={s.emptyIngredients}>
                        <Ionicons name="flask-outline" size={32} color={C.secondary[scheme] + '50'} />
                        <Text style={[s.emptyText, { color: C.secondary[scheme] }]}>No ingredients defined yet</Text>
                        <TouchableOpacity
                            onPress={() => onAddIngredient(group)}
                            style={[s.addFirstBtn, { backgroundColor: C.primary[scheme] + '15' }]}
                        >
                            <Text style={[s.addFirstText, { color: C.primary[scheme] }]}>+ Add First Ingredient</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    group.ingredients.map(item => (
                        <RecipeIngredientRow
                            key={item.id}
                            item={item}
                            onRemove={onRemoveIngredient}
                        />
                    ))
                )}
            </View>

            <TouchableOpacity
                style={[s.addBtn, { borderTopColor: C.border[scheme] }]}
                onPress={() => onAddIngredient(group)}
            >
                <Ionicons name="add-circle-outline" size={20} color={C.primary[scheme]} />
                <Text style={[s.addText, { color: C.primary[scheme] }]}>Add Ingredient</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    top: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 14,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        gap: 4,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    ingredientsSection: {
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    emptyIngredients: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    addFirstBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        marginTop: 4,
    },
    addFirstText: {
        fontSize: 12,
        fontWeight: '800',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        marginTop: 8,
    },
    addText: {
        fontSize: 14,
        fontWeight: '800',
    },
});
