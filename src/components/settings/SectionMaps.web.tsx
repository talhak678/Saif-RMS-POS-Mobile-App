import apiClient from '@/src/api/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IBranchLocation } from '@/types/settings.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SectionMaps() {
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [branches, setBranches] = useState<IBranchLocation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        address: '',
        latitude: 0,
        longitude: 0,
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await apiClient.get('/branches');
            if (res.data?.success) {
                setBranches(res.data.data);
                if (res.data.data.length > 0) {
                    handleBranchSelect(res.data.data[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleBranchSelect = (branch: IBranchLocation) => {
        setSelectedId(branch.id);
        setForm({
            address: branch.address || '',
            latitude: branch.latitude || 0,
            longitude: branch.longitude || 0,
        });
    };

    const handleUpdate = async () => {
        if (!selectedId) return;
        setLoading(true);
        try {
            const res = await apiClient.put(`/branches/${selectedId}`, {
                address: form.address,
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
            });
            if (res.data?.success) {
                Alert.alert('Success', 'Branch location updated');
                setBranches(branches.map(b => b.id === selectedId ? { ...b, ...form } : b));
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update branch');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ActivityIndicator style={{ marginTop: 50 }} color={C.primary[scheme]} />;

    return (
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
            <Text style={[s.label, { color: C.text[scheme] }]}>Select Branch</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.branchScroll}>
                {branches.map((b) => (
                    <TouchableOpacity
                        key={b.id}
                        onPress={() => handleBranchSelect(b)}
                        style={[
                            s.branchChip,
                            {
                                backgroundColor: selectedId === b.id ? C.primary[scheme] : C.inputBg[scheme],
                                borderColor: selectedId === b.id ? C.primary[scheme] : C.border[scheme]
                            }
                        ]}
                    >
                        <Text style={[s.branchText, { color: selectedId === b.id ? '#fff' : C.text[scheme] }]}>
                            {b.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedId && (
                <>
                    <View style={[s.mapContainer, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', justifyContent: 'center', alignItems: 'center', gap: 10 }]}>
                        <Ionicons name="map-outline" size={40} color={C.secondary[scheme]} />
                        <Text style={{ color: C.secondary[scheme], fontWeight: '600', textAlign: 'center', paddingHorizontal: 20 }}>
                            Map is available on mobile version only. You can still update coordinates below.
                        </Text>
                    </View>

                    <View style={s.inputGroup}>
                        <Text style={[s.label, { color: C.text[scheme] }]}>Full Address</Text>
                        <TextInput
                            style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                            value={form.address}
                            onChangeText={(v) => setForm({ ...form, address: v })}
                            placeholder="Enter branch address"
                            placeholderTextColor={C.secondary[scheme]}
                            multiline
                        />
                    </View>

                    <View style={s.row}>
                        <View style={[s.inputGroup, { flex: 1 }]}>
                            <Text style={[s.label, { color: C.text[scheme] }]}>Latitude</Text>
                            <TextInput
                                style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                value={String(form.latitude)}
                                onChangeText={(v) => setForm({ ...form, latitude: Number(v) || 0 })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={[s.inputGroup, { flex: 1 }]}>
                            <Text style={[s.label, { color: C.text[scheme] }]}>Longitude</Text>
                            <TextInput
                                style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                value={String(form.longitude)}
                                onChangeText={(v) => setForm({ ...form, longitude: Number(v) || 0 })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.btn, { backgroundColor: C.primary[scheme] }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Update Location</Text>}
                    </TouchableOpacity>
                </>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { padding: 20 },
    branchScroll: { marginBottom: 20 },
    branchChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 10,
    },
    branchText: { fontSize: 13, fontWeight: '700' },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
    },
    row: { flexDirection: 'row' },
    btn: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
