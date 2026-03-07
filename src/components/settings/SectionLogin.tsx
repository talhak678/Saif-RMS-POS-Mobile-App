import apiClient from '@/src/api/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SectionLogin() {
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUpdate = async () => {
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.put('/auth/update-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            if (res.data?.success) {
                Alert.alert('Success', 'Password updated successfully');
                setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Current Password</Text>
                <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={form.currentPassword}
                        onChangeText={(v) => setForm({ ...form, currentPassword: v })}
                        secureTextEntry={!showCurrent}
                        placeholder="••••••••"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                    <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={s.eye}>
                        <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color={C.secondary[scheme]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>New Password</Text>
                <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={form.newPassword}
                        onChangeText={(v) => setForm({ ...form, newPassword: v })}
                        secureTextEntry={!showNew}
                        placeholder="••••••••"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)} style={s.eye}>
                        <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color={C.secondary[scheme]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Confirm New Password</Text>
                <View style={[s.inputWrap, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                    <TextInput
                        style={[s.input, { color: C.text[scheme] }]}
                        value={form.confirmPassword}
                        onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                        secureTextEntry={!showConfirm}
                        placeholder="••••••••"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eye}>
                        <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={C.secondary[scheme]} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[s.btn, { backgroundColor: C.primary[scheme] }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Update Password</Text>}
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    input: { flex: 1, fontSize: 15 },
    eye: { padding: 4 },
    btn: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
