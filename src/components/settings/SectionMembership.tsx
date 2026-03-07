import apiClient from '@/src/api/apiClient';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RenewModal from './RenewModal';

export default function SectionMembership() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        if (!user?.restaurantId) return;
        try {
            const res = await apiClient.get(`/restaurants/${user.restaurantId}`);
            if (res.data?.success) {
                setRestaurant(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch restaurant:', err);
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} color={C.primary[scheme]} />;

    const plan = restaurant?.subscriptionPlan || 'FREE';
    const planColor = plan === 'PREMIUM' ? '#fbbf24' : plan === 'ENTERPRISE' ? '#8b5cf6' : plan === 'BASIC' ? '#3b82f6' : '#9ca3af';

    const features = [
        { text: 'Unlimited Categories & Items', available: plan !== 'FREE' },
        { text: 'Inventory Management', available: plan === 'PREMIUM' || plan === 'ENTERPRISE' },
        { text: 'Advanced Analytics', available: plan === 'PREMIUM' || plan === 'ENTERPRISE' },
        { text: 'Custom Domain', available: plan === 'ENTERPRISE' },
        { text: 'Priority Support', available: plan !== 'FREE' },
    ];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.container}>
                <View style={[s.planCard, { backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: C.border[scheme] }]}>
                    <View style={[s.planBadge, { backgroundColor: planColor }]}>
                        <Ionicons name="ribbon" size={20} color="#fff" />
                        <Text style={s.planName}>{plan}</Text>
                    </View>

                    <Text style={[s.statusTitle, { color: C.text[scheme] }]}>Active Membership</Text>
                    <Text style={[s.expiry, { color: C.secondary[scheme] }]}>
                        Expires on: {restaurant?.subscriptionExpiry ? new Date(restaurant.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                    </Text>

                    <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

                    <Text style={[s.sectionTitle, { color: C.text[scheme] }]}>What's included in your plan:</Text>

                    {features.map((f, i) => (
                        <View key={i} style={s.featureRow}>
                            <Ionicons
                                name={f.available ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color={f.available ? "#10b981" : C.secondary[scheme] + '50'}
                            />
                            <Text style={[s.featureText, { color: f.available ? C.text[scheme] : C.secondary[scheme] }]}>{f.text}</Text>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[s.upgradeBtn, { backgroundColor: C.primary[scheme] }]}
                        onPress={() => setShowModal(true)}
                    >
                        <Text style={s.upgradeText}>Upgrade Plan</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={s.supportBox}>
                    <Ionicons name="help-circle-outline" size={24} color={C.secondary[scheme]} />
                    <Text style={[s.supportText, { color: C.secondary[scheme] }]}>
                        Need help? Contact our support team for membership inquiries.
                    </Text>
                </View>
            </ScrollView>

            <RenewModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                currentPlan={plan}
                restaurantId={user?.restaurantId || ''}
                initialContact={{
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: '', // Phone not usually in user object but could be added
                }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { padding: 20 },
    planCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 20,
    },
    planName: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    statusTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    expiry: { fontSize: 13, marginBottom: 20, fontWeight: '500' },
    divider: { height: 1, width: '100%', marginBottom: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 16, alignSelf: 'flex-start' },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    featureText: { fontSize: 14, fontWeight: '500' },
    upgradeBtn: {
        width: '100%',
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 30,
    },
    upgradeText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    supportBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 30,
        paddingHorizontal: 10,
    },
    supportText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
});

