import SectionInfo from '@/src/components/settings/SectionInfo';
import SectionLogin from '@/src/components/settings/SectionLogin';
import SectionMaps from '@/src/components/settings/SectionMaps';
import SectionMembership from '@/src/components/settings/SectionMembership';
import SectionPayments from '@/src/components/settings/SectionPayments';
import SectionRestaurant from '@/src/components/settings/SectionRestaurant';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SettingsTab = 'INFO' | 'REST' | 'LOGIN' | 'MAPS' | 'MEMBERSHIP' | 'PAYMENTS';

const TABS: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'INFO', label: 'Info', icon: 'person-outline' },
    { id: 'REST', label: 'Restaurent Info', icon: 'restaurant-outline' },
    { id: 'LOGIN', label: 'Login Info', icon: 'lock-closed-outline' },
    { id: 'MAPS', label: 'Maps', icon: 'map-outline' },
    { id: 'MEMBERSHIP', label: 'Membership', icon: 'ribbon-outline' },
    { id: 'PAYMENTS', label: 'Payments', icon: 'receipt-outline' },
];

export default function ProfileScreen() {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [activeTab, setActiveTab] = useState<SettingsTab>('INFO');

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    const renderContent = () => {
        switch (activeTab) {
            case 'INFO': return <SectionInfo />;
            case 'REST': return <SectionRestaurant />;
            case 'LOGIN': return <SectionLogin />;
            case 'MAPS': return <SectionMaps />;
            case 'MEMBERSHIP': return <SectionMembership />;
            case 'PAYMENTS': return <SectionPayments />;
            default: return null;
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[s.root, { backgroundColor: C.screenBg[scheme] }]}
        >
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={[s.header, { borderBottomColor: C.border[scheme] }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}
                >
                    <Ionicons name="arrow-back" size={20} color={C.text[scheme]} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Profile & Settings</Text>
            </View>

            {/* ── Alert Tip ── */}
            <View style={[s.alertBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#dbeafe' }]}>
                <Ionicons name="information-circle" size={20} color={C.primary[scheme]} />
                <Text style={[s.alertText, { color: C.text[scheme] }]}>
                    For managing the POS, CMS & Website, log in to the web at <Text style={{ fontWeight: 'bold', color: C.primary[scheme] }}>app.platteros.com</Text>
                </Text>
            </View>

            {/* ── Hero Profile ───────────────────────────────────────────────────── */}
            <View style={[s.hero, { backgroundColor: C.cardBg[scheme] }]}>
                <View style={s.heroMain}>
                    {user?.restaurant?.logo ? (
                        <View style={[s.logoContainer, { borderColor: C.border[scheme] }]}>
                            <Image source={{ uri: user.restaurant.logo }} style={s.logoImg} resizeMode="contain" />
                        </View>
                    ) : (
                        <View style={[s.avatar, { backgroundColor: C.primary[scheme] }]}>
                            <Text style={s.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <View style={s.heroInfo}>
                        <Text style={[s.userName, { color: C.text[scheme] }]}>{user?.name}</Text>
                        <Text style={[s.userEmail, { color: C.secondary[scheme] }]}>{user?.email}</Text>
                        <View style={s.roleBadge}>
                            <Ionicons name="shield-checkmark" size={12} color={C.primary[scheme]} />
                            <Text style={[s.roleText, { color: C.primary[scheme] }]}>{user?.role?.name}</Text>
                        </View>
                    </View>
                </View>

                {user?.restaurant && (
                    <View style={[s.restBox, { backgroundColor: isDark ? '#1f2937' : '#f8fafc', borderColor: C.border[scheme] }]}>
                        <View style={s.restHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.restName, { color: C.text[scheme] }]}>{user.restaurant.name}</Text>
                                <Text style={[s.restSlug, { color: C.secondary[scheme] }]}>{user.restaurant.customDomain ? user.restaurant.customDomain : user.restaurant.slug + ".platteros.com"}</Text>
                            </View>
                            <View style={s.socials}>
                                {user.restaurant.facebookUrl && (
                                    <TouchableOpacity style={s.socialBtn}><Ionicons name="logo-facebook" size={18} color="#1877F2" /></TouchableOpacity>
                                )}
                                {user.restaurant.instagramUrl && (
                                    <TouchableOpacity style={s.socialBtn}><Ionicons name="logo-instagram" size={18} color="#E4405F" /></TouchableOpacity>
                                )}
                                {user.restaurant.tiktokUrl && (
                                    <TouchableOpacity style={s.socialBtn}><Ionicons name="logo-tiktok" size={18} color={C.text[scheme]} /></TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {user.restaurant.description && (
                            <Text style={[s.restDesc, { color: C.secondary[scheme] }]} numberOfLines={2}>
                                {user.restaurant.description}
                            </Text>
                        )}
                    </View>
                )}
            </View>

            {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
            <View style={[s.tabBarWrap, { borderBottomColor: C.border[scheme] }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                style={[
                                    s.tabItem,
                                    isActive && { borderBottomColor: C.primary[scheme] }
                                ]}
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={18}
                                    color={isActive ? C.primary[scheme] : C.secondary[scheme]}
                                />
                                <Text style={[
                                    s.tabLabel,
                                    { color: isActive ? C.primary[scheme] : C.secondary[scheme] },
                                    isActive && s.activeTabLabel
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Tab Content ────────────────────────────────────────────────────── */}
            <View style={s.content}>
                {renderContent()}
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 52,
        paddingBottom: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    backBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    hero: {
        padding: 20,
        gap: 16,
    },
    heroMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        padding: 4,
    },
    logoImg: {
        width: '100%',
        height: '100%',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '900' },
    heroInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
    userEmail: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

    restBox: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 4,
    },
    restHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    restName: { fontSize: 15, fontWeight: '800' },
    restSlug: { fontSize: 12, fontWeight: '600' },
    restDesc: { fontSize: 12, lineHeight: 18, fontWeight: '500', opacity: 0.8 },
    socials: { flexDirection: 'row', gap: 8 },
    socialBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    tabBarWrap: { borderBottomWidth: 1 },
    tabScroll: { paddingHorizontal: 16, gap: 24, height: 50 },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        paddingHorizontal: 4,
    },
    tabLabel: { fontSize: 14, fontWeight: '700' },
    activeTabLabel: { fontWeight: '900' },

    content: { flex: 1 },

    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        marginBottom: 0,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    alertText: { fontSize: 13, flex: 1, fontWeight: '500', lineHeight: 18 },
});
