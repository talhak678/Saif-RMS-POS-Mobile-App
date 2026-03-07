import apiClient from '@/src/api/apiClient';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SectionInfo() {
    const { user, setUser } = useAuth();
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.put(`/users/${user?.id}`, { name, email });
            if (res.data?.success) {
                setUser({ ...user!, name, email });
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Full Name</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={C.secondary[scheme]}
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Email Address</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter your email"
                    placeholderTextColor={C.secondary[scheme]}
                />
            </View>

            <TouchableOpacity
                style={[s.btn, { backgroundColor: C.primary[scheme] }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save Changes</Text>}
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    btn: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
