import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IBranch } from '@/types/stock.types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
    branch: IBranch;
    isActive: boolean;
    onPress: () => void;
}

export default function BranchChip({ branch, isActive, onPress }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                s.chip,
                {
                    backgroundColor: isActive ? C.primary[scheme] : C.inputBg[scheme],
                    borderColor: isActive ? C.primary[scheme] : C.border[scheme]
                }
            ]}
        >
            <Text style={[
                s.text,
                { color: isActive ? '#fff' : C.text[scheme] }
            ]}>
                {branch.name}
            </Text>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: '700',
    },
});
