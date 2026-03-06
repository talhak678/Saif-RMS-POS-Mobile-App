import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IIngredientForm } from '@/types/ingredient.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import UnitSuggestions from './UnitSuggestions';

interface Props {
    title: string;
    submitLabel: string;
    initial?: IIngredientForm;
    onSubmit: (form: IIngredientForm) => Promise<void>;
    onClose: () => void;
}

export default function IngredientForm({ title, submitLabel, initial, onSubmit, onClose }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [form, setForm] = useState<IIngredientForm>(initial || { name: '', unit: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; unit?: string }>({});

    const handleSubmit = async () => {
        const errs: { name?: string; unit?: string } = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.unit.trim()) errs.unit = 'Unit is required';

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(form);
        } catch {
            // Handle error if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={[s.title, { color: C.text[scheme] }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                    <Ionicons name="close" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <View style={s.body}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Ingredient Name *</Text>
                <View style={[
                    s.inputContainer,
                    { backgroundColor: C.inputBg[scheme], borderColor: errors.name ? '#ef4444' : C.border[scheme] }
                ]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={form.name}
                        onChangeText={v => {
                            setForm(f => ({ ...f, name: v }));
                            setErrors(e => ({ ...e, name: undefined }));
                        }}
                        placeholder="e.g. Tomatoes"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                    {errors.name && <Ionicons name="alert-circle" size={18} color="#ef4444" />}
                </View>
                {errors.name && <Text style={s.errorText}>{errors.name}</Text>}

                <Text style={[s.label, { color: C.text[scheme], marginTop: 16 }]}>Unit *</Text>
                <View style={[
                    s.inputContainer,
                    { backgroundColor: C.inputBg[scheme], borderColor: errors.unit ? '#ef4444' : C.border[scheme] }
                ]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={form.unit}
                        onChangeText={v => {
                            setForm(f => ({ ...f, unit: v }));
                            setErrors(e => ({ ...e, unit: undefined }));
                        }}
                        placeholder="e.g. kg"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                    {errors.unit && <Ionicons name="alert-circle" size={18} color="#ef4444" />}
                </View>
                {errors.unit && <Text style={s.errorText}>{errors.unit}</Text>}

                <UnitSuggestions onSelect={unit => setForm(f => ({ ...f, unit }))} />

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[s.submitBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={s.submitText}>{submitLabel}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#0001',
        marginBottom: 20,
    },
    body: {
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 14,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    submitBtn: {
        marginTop: 30,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
