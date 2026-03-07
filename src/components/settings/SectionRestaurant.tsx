import apiClient from '@/src/api/apiClient';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { uploadToCloudinary } from '@/src/utils/cloudinary';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SectionRestaurant() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        logo: '',
        description: '',
        facebookUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
    });

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        if (!user?.restaurantId) return;
        try {
            const res = await apiClient.get(`/restaurants/${user.restaurantId}`);
            if (res.data?.success) {
                setForm(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch restaurant:', err);
        } finally {
            setFetching(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const url = await uploadToCloudinary(result.assets[0].uri);
                setForm({ ...form, logo: url });
            } catch (err) {
                Alert.alert('Error', 'Failed to upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdate = async () => {
        if (!form.name.trim()) {
            Alert.alert('Error', 'Restaurant name is required');
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.put(`/restaurants/${user?.restaurantId}`, form);
            if (res.data?.success) {
                Alert.alert('Success', 'Restaurant info updated');
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update restaurant');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ActivityIndicator style={{ marginTop: 50 }} color={C.primary[scheme]} />;

    return (
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={s.logoContainer} onPress={pickImage}>
                {form.logo ? (
                    <Image source={{ uri: form.logo }} style={s.logo} />
                ) : (
                    <View style={[s.logoPlaceholder, { backgroundColor: C.inputBg[scheme] }]}>
                        <Ionicons name="camera-outline" size={32} color={C.secondary[scheme]} />
                    </View>
                )}
                <View style={[s.editBadge, { backgroundColor: C.primary[scheme] }]}>
                    <Ionicons name="pencil" size={14} color="#fff" />
                </View>
            </TouchableOpacity>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Restaurant Name *</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                    placeholder="e.g. Tasty Bites"
                    placeholderTextColor={C.secondary[scheme]}
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Slug (Username)</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.slug}
                    onChangeText={(v) => setForm({ ...form, slug: v })}
                    placeholder="tasty-bites"
                    placeholderTextColor={C.secondary[scheme]}
                    autoCapitalize="none"
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Description</Text>
                <TextInput
                    style={[s.input, s.textArea, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    placeholder="Tell something about your restaurant"
                    placeholderTextColor={C.secondary[scheme]}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <Text style={[s.sectionTitle, { color: C.text[scheme] }]}>Social Links</Text>

            <View style={s.inputGroup}>
                <View style={s.labelRow}>
                    <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                    <Text style={[s.label, { color: C.text[scheme], marginLeft: 8 }]}>Facebook URL</Text>
                </View>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.facebookUrl}
                    onChangeText={(v) => setForm({ ...form, facebookUrl: v })}
                    placeholder="https://facebook.com/your-page"
                    placeholderTextColor={C.secondary[scheme]}
                    autoCapitalize="none"
                />
            </View>

            <View style={s.inputGroup}>
                <View style={s.labelRow}>
                    <Ionicons name="logo-instagram" size={18} color="#E4405F" />
                    <Text style={[s.label, { color: C.text[scheme], marginLeft: 8 }]}>Instagram URL</Text>
                </View>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.instagramUrl}
                    onChangeText={(v) => setForm({ ...form, instagramUrl: v })}
                    placeholder="https://instagram.com/your-profile"
                    placeholderTextColor={C.secondary[scheme]}
                    autoCapitalize="none"
                />
            </View>

            <View style={s.inputGroup}>
                <View style={s.labelRow}>
                    <Ionicons name="logo-twitter" size={18} color="#000" />
                    <Text style={[s.label, { color: C.text[scheme], marginLeft: 8 }]}>TikTok URL</Text>
                </View>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.tiktokUrl}
                    onChangeText={(v) => setForm({ ...form, tiktokUrl: v })}
                    placeholder="https://tiktok.com/@your-profile"
                    placeholderTextColor={C.secondary[scheme]}
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity
                style={[s.btn, { backgroundColor: C.primary[scheme] }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Update Restaurant</Text>}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { padding: 20 },
    logoContainer: {
        alignSelf: 'center',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 30,
        position: 'relative',
    },
    logo: { width: 100, height: 100, borderRadius: 50 },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    input: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 10, marginBottom: 20 },
    btn: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
