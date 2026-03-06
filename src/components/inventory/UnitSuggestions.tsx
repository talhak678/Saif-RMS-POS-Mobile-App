import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const UNIT_SUGGESTIONS = ['kg', 'grams', 'litre', 'ml', 'pcs', 'box', 'dozen'];

interface Props {
    onSelect: (unit: string) => void;
}

export default function UnitSuggestions({ onSelect }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    return (
        <View style={s.container}>
            <Text style={[s.label, { color: C.secondary[scheme] }]}>Suggestions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.list}>
                {UNIT_SUGGESTIONS.map(unit => (
                    <TouchableOpacity
                        key={unit}
                        onPress={() => onSelect(unit)}
                        style={[s.chip, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}
                    >
                        <Text style={[s.chipText, { color: C.text[scheme] }]}>{unit}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    list: {
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
