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
        status: 'ACTIVE',
        customDomain: '',
        openingTime: '',
        closingTime: '',
        phone: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        notificationEmail: '',
        country: 'Pakistan',
        countryCode: '+92',
        address: '',
        city: '',
        postCode: '',
        state: '',
        cuisines: [] as string[],
        serviceType: 'BOTH',
    });

    const CUISINES = ['Italian', 'Chinese', 'Fast Food', 'Bakery', 'Indian', 'International', 'Desi', 'Continental', 'Middle Eastern', 'Japanese'];

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        if (!user?.restaurantId) return;
        try {
            const res = await apiClient.get(`/restaurants/${user.restaurantId}`);
            if (res.data?.success) {
                const data = res.data.data;
                setForm({
                    ...form,
                    ...data,
                    cuisines: Array.isArray(data.cuisines) ? data.cuisines : [],
                });
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

    const toggleCuisine = (c: string) => {
        const current = [...form.cuisines];
        if (current.includes(c)) {
            setForm({ ...form, cuisines: current.filter(item => item !== c) });
        } else {
            setForm({ ...form, cuisines: [...current, c] });
        }
    };

    if (fetching) return <ActivityIndicator style={{ marginTop: 50 }} color={C.primary[scheme]} />;

    const restaurantUrl = `https://${form.slug}.platteros.com`;

    return (
        <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
            {/* ── Status Section ── */}
            <View style={s.infoRow}>
                <Text style={[s.label, { color: C.secondary[scheme], width: '35%' }]}>Status</Text>
                <View style={[s.badge, { backgroundColor: form.status === 'ACTIVE' ? '#dcfce7' : '#fef9c3' }]}>
                    <Text style={[s.badgeText, { color: form.status === 'ACTIVE' ? '#166534' : '#854d0e' }]}>
                        {form.status || 'ACTIVE'}
                    </Text>
                </View>
            </View>

            {/* ── Public URL ── */}
            <View style={s.infoRow}>
                <Text style={[s.label, { color: C.secondary[scheme], width: '35%' }]}>Your Website</Text>
                <TouchableOpacity onPress={() => Alert.alert('Visit Website', restaurantUrl)}>
                    <Text style={[s.webLink, { color: C.primary[scheme] }]}>
                        {restaurantUrl} <Ionicons name="open-outline" size={14} />
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Logo ── */}
            <View style={[s.infoRow, { alignItems: 'flex-start', marginVertical: 15 }]}>
                <Text style={[s.label, { color: C.secondary[scheme], width: '35%' }]}>Restaurant Logo</Text>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={s.logoCard} onPress={pickImage}>
                        {form.logo ? (
                            <Image source={{ uri: form.logo }} style={s.logo} />
                        ) : (
                            <View style={[s.logoPlaceholder, { backgroundColor: C.inputBg[scheme], borderColor: C.border[scheme] }]}>
                                <Ionicons name="camera-outline" size={24} color={C.secondary[scheme]} />
                            </View>
                        )}
                        <View style={[s.editBadge, { backgroundColor: C.primary[scheme] }]}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={s.logoHint}>Recommended: 500x500px (1:1)</Text>
                </View>
            </View>

            {/* ── Operating Hours ── */}
            <View style={s.sectionHeader}>
                <Ionicons name="time-outline" size={18} color={C.primary[scheme]} />
                <Text style={[s.sectionTitle, { color: C.text[scheme] }]}>Operating Hours</Text>
            </View>
            <View style={s.row}>
                <View style={[s.inputWrap, { marginRight: 10 }]}>
                    <Text style={[s.miniLabel, { color: C.secondary[scheme] }]}>Opening Time</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.openingTime}
                        onChangeText={(v) => setForm({ ...form, openingTime: v })}
                        placeholder="09:00"
                    />
                </View>
                <View style={s.inputWrap}>
                    <Text style={[s.miniLabel, { color: C.secondary[scheme] }]}>Closing Time</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.closingTime}
                        onChangeText={(v) => setForm({ ...form, closingTime: v })}
                        placeholder="23:00"
                    />
                </View>
            </View>

            {/* ── Form Fields (Simplified Matching Web) ── */}
            {[
                { label: 'Restaurant Slug', key: 'slug', placeholder: 'tasty-bites' },
                { label: 'Custom Domain', key: 'customDomain', placeholder: 'www.myrestaurant.com' },
                { label: 'Restaurant Name', key: 'name', placeholder: 'Tasty Bites' },
                { label: 'Restaurant Phone', key: 'phone', placeholder: '+1 234 567 890' },
                { label: 'Contact Name', key: 'contactName', placeholder: 'Full Name' },
                { label: 'Contact Phone', key: 'contactPhone', placeholder: '+1 234 567 890' },
                { label: 'Contact Email', key: 'contactEmail', placeholder: 'admin@example.com' },
            ].map((field) => (
                <View key={field.key} style={s.inputGroup}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>{field.label}</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={(form as any)[field.key]}
                        onChangeText={(v) => setForm({ ...form, [field.key]: v })}
                        placeholder={field.placeholder}
                        autoCapitalize="none"
                        placeholderTextColor={C.secondary[scheme]}
                    />
                </View>
            ))}

            {/* ── Notification Email (Special) ── */}
            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Notification Email</Text>
                <View style={s.row}>
                    <TextInput
                        style={[s.input, { flex: 1, backgroundColor: isDark ? '#1f2937' : '#f3f4f6', color: C.text[scheme], borderColor: C.border[scheme], opacity: 0.8 }]}
                        value={form.notificationEmail}
                        editable={false}
                    />
                    <TouchableOpacity style={[s.updateBtn, { backgroundColor: C.primary[scheme] }]}>
                        <Ionicons name="mail-outline" size={16} color="#fff" />
                        <Text style={s.updateBtnText}>Update</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Country & Address ── */}
            <View style={s.row}>
                <View style={[s.inputWrap, { flex: 2, marginRight: 10 }]}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Country</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.country}
                        onChangeText={(v) => setForm({ ...form, country: v })}
                    />
                </View>
                <View style={s.inputWrap}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Code</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.countryCode}
                        onChangeText={(v) => setForm({ ...form, countryCode: v })}
                    />
                </View>
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Street Address</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.address}
                    onChangeText={(v) => setForm({ ...form, address: v })}
                    placeholder="Address..."
                />
            </View>

            <View style={s.row}>
                <View style={[s.inputWrap, { marginRight: 10 }]}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>City</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.city}
                        onChangeText={(v) => setForm({ ...form, city: v })}
                    />
                </View>
                <View style={s.inputWrap}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Post Code</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        value={form.postCode}
                        onChangeText={(v) => setForm({ ...form, postCode: v })}
                    />
                </View>
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>State/Region</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={form.state}
                    onChangeText={(v) => setForm({ ...form, state: v })}
                />
            </View>

            {/* ── Cuisine ── */}
            <Text style={[s.label, { color: C.text[scheme], marginBottom: 12 }]}>Cuisine</Text>
            <View style={s.cuisineGrid}>
                {CUISINES.map(c => {
                    const isSelected = form.cuisines.includes(c);
                    return (
                        <TouchableOpacity
                            key={c}
                            onPress={() => toggleCuisine(c)}
                            style={[s.cuisineTag, { backgroundColor: isSelected ? C.primary[scheme] : C.inputBg[scheme], borderColor: isSelected ? C.primary[scheme] : C.border[scheme] }]}
                        >
                            <Text style={[s.cuisineText, { color: isSelected ? '#fff' : C.secondary[scheme] }]}>{c}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Service Type ── */}
            <Text style={[s.label, { color: C.text[scheme], marginTop: 20, marginBottom: 10 }]}>Pick Up or Delivery?</Text>
            <View style={s.row}>
                {['DELIVERY', 'PICKUP', 'BOTH'].map(type => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setForm({ ...form, serviceType: type })}
                        style={[s.choiceBtn, { backgroundColor: form.serviceType === type ? C.primary[scheme] : C.inputBg[scheme], borderColor: C.border[scheme] }]}
                    >
                        <Text style={[s.choiceText, { color: form.serviceType === type ? '#fff' : C.secondary[scheme] }]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[s.submitBtn, { backgroundColor: C.primary[scheme] }]}
                onPress={handleUpdate}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Save</Text>}
            </TouchableOpacity>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { padding: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    webLink: { fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },

    label: { fontSize: 14, fontWeight: '800' },
    miniLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },

    logoCard: { width: 80, height: 80, borderRadius: 12, position: 'relative' },
    logo: { width: 80, height: 80, borderRadius: 12 },
    logoPlaceholder: { width: 80, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed' },
    editBadge: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    logoHint: { fontSize: 10, color: '#64748b', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: '900' },

    row: { flexDirection: 'row', alignItems: 'center' },
    inputWrap: { flex: 1 },
    inputGroup: { marginBottom: 16 },
    input: { height: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },

    updateBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 10, marginLeft: 10, gap: 6 },
    updateBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

    cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cuisineTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    cuisineText: { fontSize: 12, fontWeight: '700' },

    choiceBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginHorizontal: 4 },
    choiceText: { fontSize: 11, fontWeight: '800' },

    submitBtn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
