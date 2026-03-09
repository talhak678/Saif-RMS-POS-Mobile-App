import apiClient from '@/src/api/apiClient';
import PlanCard, { IPaymentPlan } from '@/src/components/subscription/PlanCard';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PaymentPlansScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<IPaymentPlan[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/subscription-prices');
            if (res.data?.success) {
                setPlans(res.data.data);
            } else {
                setError('Failed to fetch plans');
            }
        } catch (err) {
            console.error('Fetch plans error:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const renderEmpty = () => (
        <View style={s.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={C.secondary[scheme]} style={{ opacity: 0.3 }} />
            <Text style={[s.emptyText, { color: C.secondary[scheme] }]}>
                No plans configured for your branch.
            </Text>
            <TouchableOpacity style={[s.retryBtn, { backgroundColor: C.primary[scheme] }]} onPress={fetchPlans}>
                <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.text }]}>Payment Plans</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.primary[scheme]} />
                    <Text style={[s.loadingText, { color: C.secondary[scheme] }]}>Loading plans...</Text>
                </View>
            ) : error ? (
                <View style={s.center}>
                    <Ionicons name="alert-circle-outline" size={48} color={C.secondary[scheme]} />
                    <Text style={[s.errorText, { color: C.secondary[scheme] }]}>{error}</Text>
                    <TouchableOpacity style={[s.retryBtn, { backgroundColor: C.primary[scheme], marginTop: 20 }]} onPress={fetchPlans}>
                        <Text style={s.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={plans}
                    renderItem={({ item }) => <PlanCard item={item} />}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 14,
        fontWeight: '700',
    },
    errorText: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        opacity: 0.6,
    },
    retryBtn: {
        marginTop: 30,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
    },
});
