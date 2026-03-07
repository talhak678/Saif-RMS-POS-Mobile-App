import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRiderForm, RiderStatus } from '@/types/rider.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
    initial?: IRiderForm;
    title: string;
    submitLabel: string;
    onClose: () => void;
    onSubmit: (form: IRiderForm) => Promise<void>;
}

const statuses: RiderStatus[] = ['AVAILABLE', 'BUSY', 'OFFLINE'];

export default function RiderFormSheet({ initial, title, submitLabel, onClose, onSubmit }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [form, setForm] = useState<IRiderForm>(initial || {
        name: '',
        phone: '',
        status: 'AVAILABLE'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

    const validate = () => {
        const errs: { name?: string; phone?: string } = {};
        if (!form.name.trim()) errs.name = 'Full Name is required';
        if (!form.phone.trim()) errs.phone = 'Phone Number is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit(form);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
            <View style={s.header}>
                <Text style={[s.title, { color: C.text[scheme] }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                    <Ionicons name="close" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
            </View>

            <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <View style={s.inputBox}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Full Name *</Text>
                    <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: errors.name ? '#ef4444' : C.border[scheme] }]}>
                        <TextInput
                            style={[s.input, { color: C.text[scheme] }]}
                            value={form.name}
                            onChangeText={v => {
                                setForm({ ...form, name: v });
                                setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="e.g. Usman Khan"
                            placeholderTextColor={C.secondary[scheme]}
                        />
                        {errors.name && <Ionicons name="alert-circle" size={20} color="#ef4444" />}
                    </View>
                    {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
                </View>

                <View style={s.inputBox}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Phone Number *</Text>
                    <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: errors.phone ? '#ef4444' : C.border[scheme] }]}>
                        <TextInput
                            style={[s.input, { color: C.text[scheme] }]}
                            value={form.phone}
                            onChangeText={v => {
                                setForm({ ...form, phone: v });
                                setErrors({ ...errors, phone: undefined });
                            }}
                            placeholder="+1 156 4582 42"
                            placeholderTextColor={C.secondary[scheme]}
                            keyboardType="phone-pad"
                        />
                        {errors.phone && <Ionicons name="alert-circle" size={20} color="#ef4444" />}
                    </View>
                    {errors.phone && <Text style={s.errorText}>{errors.phone}</Text>}
                </View>

                <View style={s.inputBox}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Initial Status</Text>
                    <View style={s.pickerRow}>
                        {statuses.map(st => (
                            <TouchableOpacity
                                key={st}
                                onPress={() => setForm({ ...form, status: st })}
                                style={[
                                    s.pickerItem,
                                    {
                                        backgroundColor: form.status === st ? C.primary[scheme] : C.inputBg[scheme],
                                        borderColor: form.status === st ? C.primary[scheme] : C.border[scheme]
                                    }
                                ]}
                            >
                                <Text style={[s.pickerText, { color: form.status === st ? '#fff' : C.text[scheme] }]}>
                                    {st.charAt(0) + st.slice(1).toLowerCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[s.submitBtn, { backgroundColor: C.primary[scheme] }]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={s.submitText}>{submitLabel}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    content: {
        gap: 20,
        paddingBottom: 40,
    },
    inputBox: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 8,
    },
    pickerItem: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 13,
        fontWeight: '700',
    },
    submitBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
