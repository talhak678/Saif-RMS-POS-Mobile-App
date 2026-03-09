import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface IPaymentPlan {
    id: string;
    plan: string;
    price: string;
    billingCycle: string;
    isActive: boolean;
    features?: string[];
}

interface PlanCardProps {
    item: IPaymentPlan;
}

export default function PlanCard({ item }: PlanCardProps) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const isActivePlan = item.isActive;

    return (
        <View style={[
            s.card,
            {
                backgroundColor: C.cardBg[scheme],
                borderColor: isActivePlan ? C.primary[scheme] : C.border[scheme],
                borderWidth: isActivePlan ? 2 : 1
            }
        ]}>
            <View style={s.cardHeader}>
                <Text style={[s.planName, { color: C.text[scheme] }]}>{item.plan}</Text>
                <View style={[
                    s.badge,
                    { backgroundColor: item.isActive ? '#dcfce7' : '#f3f4f6' }
                ]}>
                    <Ionicons
                        name={item.isActive ? "checkmark-circle" : "close-circle"}
                        size={12}
                        color={item.isActive ? '#166534' : '#64748b'}
                    />
                    <Text style={[
                        s.badgeText,
                        { color: item.isActive ? '#166534' : '#64748b' }
                    ]}>
                        {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                </View>
            </View>

            <Text style={[s.priceText, { color: C.primary[scheme] }]}>
                $ {item.price} <Text style={[s.cycleText, { color: C.secondary[scheme] }]}>/ {item.billingCycle.toLowerCase()}</Text>
            </Text>

            <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

            {item.features?.map((feature, index) => (
                <View key={index} style={s.featureRow}>
                    <Ionicons name="checkmark" size={14} color={C.primary[scheme]} />
                    <Text style={[s.featureText, { color: C.text[scheme] }]}>{feature}</Text>
                </View>
            ))}
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    planName: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    priceText: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 15,
    },
    cycleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 15,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
