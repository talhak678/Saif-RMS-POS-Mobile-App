import apiClient from '@/src/api/apiClient';
import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PlanPrice {
    id: string;
    plan: string;
    price: string;
    billingCycle: string;
    isActive: boolean;
    features: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentPlan?: string;
    restaurantId: string;
    initialContact?: {
        name: string;
        email: string;
        phone: string;
    };
}

const PLAN_ORDER = ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"];
const PLAN_BADGE: Record<string, { bg: string, text: string }> = {
    FREE: { bg: '#f3f4f6', text: '#4b5563' },
    BASIC: { bg: '#dbeafe', text: '#1e40af' },
    PREMIUM: { bg: '#fae8ff', text: '#86198f' },
    ENTERPRISE: { bg: '#fef3c7', text: '#92400e' },
};

export default function RenewModal({ isOpen, onClose, currentPlan, restaurantId, initialContact }: Props) {
    const { colors, isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const [loading, setLoading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<PlanPrice[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PlanPrice | null>(null);
    const [description, setDescription] = useState("");

    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (isOpen && initialContact) {
            setContactInfo({
                name: initialContact.name || "",
                email: initialContact.email || "",
                phone: initialContact.phone || "",
            });
        }
    }, [initialContact, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchPlans = async () => {
            setPlansLoading(true);
            try {
                const res = await apiClient.get("/subscription-prices");
                if (res.data?.success) {
                    const allPlans: PlanPrice[] = res.data.data || [];
                    const sorted = allPlans
                        .filter((p) => p.isActive)
                        .sort((a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan));
                    setPlans(sorted);

                    const currentIdx = PLAN_ORDER.indexOf(currentPlan || "FREE");
                    const nextPlan = sorted.find((p) => PLAN_ORDER.indexOf(p.plan) > currentIdx);
                    if (nextPlan) setSelectedPlan(nextPlan);
                    else if (sorted.length > 0) setSelectedPlan(sorted[0]);
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, [isOpen, currentPlan]);

    const handleSubmit = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        try {
            const res = await apiClient.post("/subscription-requests", {
                plan: selectedPlan.plan,
                billingCycle: selectedPlan.billingCycle,
                description,
                restaurantId,
                contactName: contactInfo.name,
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
            });
            if (res.data?.success) {
                setStep(4);
            }
        } catch (error) {
            console.error("Submission error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setDescription("");
        onClose();
    };

    const renderHeader = () => {
        let title = "Renew / Upgrade Plan";
        let sub = `Current: ${currentPlan || "FREE"}`;
        if (step === 2) { title = "Contact Info"; sub = "Super Admin will reach out"; }
        if (step === 3) { title = "Review Request"; sub = "Confirm your selection"; }
        if (step === 4) { title = "Request Sent!"; sub = "Super Admin notified"; }

        return (
            <View style={[s.header, { borderBottomColor: C.border[scheme] }]}>
                <View>
                    <Text style={[s.headerTitle, { color: C.text[scheme] }]}>{title}</Text>
                    <Text style={[s.headerSub, { color: C.secondary[scheme] }]}>{sub}</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
                    <Ionicons name="close" size={24} color={C.secondary[scheme]} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.sheet, { backgroundColor: C.cardBg[scheme] }]}>
                    {renderHeader()}

                    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                        {step === 1 && (
                            <View style={s.stepContainer}>
                                {plansLoading ? (
                                    <ActivityIndicator size="large" color={C.primary[scheme]} style={{ marginVertical: 40 }} />
                                ) : (
                                    <>
                                        <View style={s.plansGrid}>
                                            {plans.map(plan => {
                                                const isCurrent = plan.plan === currentPlan;
                                                const isSelected = selectedPlan?.id === plan.id;
                                                const colors = PLAN_BADGE[plan.plan] || PLAN_BADGE.BASIC;
                                                return (
                                                    <TouchableOpacity
                                                        key={plan.id}
                                                        disabled={isCurrent}
                                                        onPress={() => setSelectedPlan(plan)}
                                                        style={[
                                                            s.planCard,
                                                            { borderColor: isSelected ? C.primary[scheme] : C.border[scheme] },
                                                            isSelected && { backgroundColor: C.primary[scheme] + '05' },
                                                            isCurrent && { opacity: 0.5 }
                                                        ]}
                                                    >
                                                        <View style={[s.badge, { backgroundColor: colors.bg }]}>
                                                            <Text style={[s.badgeText, { color: colors.text }]}>{plan.plan}</Text>
                                                        </View>
                                                        <Text style={[s.price, { color: C.text[scheme] }]}>${plan.price}</Text>
                                                        <Text style={[s.cycle, { color: C.secondary[scheme] }]}>/{plan.billingCycle.toLowerCase()}</Text>

                                                        {plan.features.slice(0, 3).map((f, i) => (
                                                            <View key={i} style={s.featureRow}>
                                                                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                                                <Text style={[s.featureText, { color: C.secondary[scheme] }]} numberOfLines={1}>{f}</Text>
                                                            </View>
                                                        ))}

                                                        {isSelected && (
                                                            <View style={s.checkMark}>
                                                                <Ionicons name="checkmark-circle" size={20} color={C.primary[scheme]} />
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <Text style={[s.label, { color: C.text[scheme], marginTop: 20 }]}>Additional Notes (Optional)</Text>
                                        <TextInput
                                            style={[s.input, s.textArea, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                            placeholder="Requirements..."
                                            placeholderTextColor={C.secondary[scheme]}
                                            multiline
                                            value={description}
                                            onChangeText={setDescription}
                                        />

                                        <TouchableOpacity style={[s.mainBtn, { backgroundColor: C.primary[scheme] }]} onPress={() => setStep(2)}>
                                            <Text style={s.mainBtnText}>Next Step</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        )}

                        {step === 2 && (
                            <View style={s.stepContainer}>
                                <Text style={[s.label, { color: C.text[scheme] }]}>Full Name</Text>
                                <TextInput
                                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                    value={contactInfo.name}
                                    onChangeText={v => setContactInfo({ ...contactInfo, name: v })}
                                />
                                <Text style={[s.label, { color: C.text[scheme], marginTop: 15 }]}>Email Address</Text>
                                <TextInput
                                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                    value={contactInfo.email}
                                    onChangeText={v => setContactInfo({ ...contactInfo, email: v })}
                                    keyboardType="email-address"
                                />
                                <Text style={[s.label, { color: C.text[scheme], marginTop: 15 }]}>Phone Number</Text>
                                <TextInput
                                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                                    value={contactInfo.phone}
                                    onChangeText={v => setContactInfo({ ...contactInfo, phone: v })}
                                    keyboardType="phone-pad"
                                />

                                <View style={s.btnRow}>
                                    <TouchableOpacity style={[s.secBtn, { borderColor: C.border[scheme] }]} onPress={() => setStep(1)}>
                                        <Text style={[s.secBtnText, { color: C.secondary[scheme] }]}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[s.mainBtn, { flex: 2, backgroundColor: C.primary[scheme] }]} onPress={() => setStep(3)}>
                                        <Text style={s.mainBtnText}>Review Request</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === 3 && selectedPlan && (
                            <View style={s.stepContainer}>
                                <View style={[s.reviewBox, { backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderColor: C.border[scheme] }]}>
                                    <View style={s.reviewRow}>
                                        <Text style={[s.reviewLabel, { color: C.secondary[scheme] }]}>Plan</Text>
                                        <Text style={[s.reviewVal, { color: C.text[scheme] }]}>{selectedPlan.plan}</Text>
                                    </View>
                                    <View style={s.reviewRow}>
                                        <Text style={[s.reviewLabel, { color: C.secondary[scheme] }]}>Price</Text>
                                        <Text style={[s.reviewVal, { color: C.primary[scheme] }]}>${selectedPlan.price} / {selectedPlan.billingCycle}</Text>
                                    </View>
                                    <View style={s.reviewRow}>
                                        <Text style={[s.reviewLabel, { color: C.secondary[scheme] }]}>Contact</Text>
                                        <Text style={[s.reviewVal, { color: C.text[scheme], textAlign: 'right' }]}>
                                            {contactInfo.name}{"\n"}{contactInfo.phone}
                                        </Text>
                                    </View>
                                </View>

                                <View style={s.btnRow}>
                                    <TouchableOpacity style={[s.secBtn, { borderColor: C.border[scheme] }]} onPress={() => setStep(2)}>
                                        <Text style={[s.secBtnText, { color: C.secondary[scheme] }]}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[s.mainBtn, { flex: 2, backgroundColor: '#10b981' }]} onPress={handleSubmit} disabled={loading}>
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.mainBtnText}>Submit Request</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === 4 && (
                            <View style={s.successWrap}>
                                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                                <Text style={[s.successTitle, { color: C.text[scheme] }]}>Request Submitted!</Text>
                                <Text style={[s.successSub, { color: C.secondary[scheme] }]}>
                                    Our Super Admin will review your upgrade request and contact you shortly.
                                </Text>
                                <TouchableOpacity style={[s.mainBtn, { backgroundColor: C.primary[scheme], width: '100%' }]} onPress={handleClose}>
                                    <Text style={s.mainBtnText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', minHeight: '50%' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    headerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    closeBtn: { padding: 4 },
    content: { padding: 20 },
    stepContainer: { gap: 4 },
    plansGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    planCard: { width: '48%', borderWidth: 1.5, borderRadius: 16, padding: 12, position: 'relative' },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 8 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    price: { fontSize: 20, fontWeight: '800' },
    cycle: { fontSize: 11, fontWeight: '600' },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    featureText: { fontSize: 10, flex: 1 },
    checkMark: { position: 'absolute', top: 10, right: 10 },
    label: { fontSize: 12, fontWeight: '800', marginBottom: 6 },
    input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14 },
    textArea: { height: 80, textAlignVertical: 'top' },
    mainBtn: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
    mainBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    secBtn: { flex: 1, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginTop: 20 },
    secBtnText: { fontSize: 15, fontWeight: '700' },
    btnRow: { flexDirection: 'row', gap: 12 },
    reviewBox: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 10 },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    reviewLabel: { fontSize: 12, fontWeight: '700' },
    reviewVal: { fontSize: 13, fontWeight: '800' },
    successWrap: { alignItems: 'center', paddingVertical: 30, gap: 12 },
    successTitle: { fontSize: 22, fontWeight: '900' },
    successSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 10 },
});
