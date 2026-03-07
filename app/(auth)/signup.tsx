import apiPublic from "@/src/api/apiPublic";
import { useTheme } from "@/src/context/ThemeContext";
import { C } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

type Step = 1 | 2 | 3 | 4 | 5;

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    type: string;
}

export default function SignupScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? "dark" : "light";

    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        acceptedTerms: false,
        selectedPlan: null as Plan | null,
        phone: "",
        description: "",
    });

    // Fetch Plans on Step 2
    useEffect(() => {
        if (step === 2 && plans.length === 0) {
            fetchPlans();
        }
    }, [step]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await apiPublic.get("/subscription-prices");
            // Basic fallback if API returns unexpected format
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setPlans(data);
        } catch (err) {
            console.error("Fetch plans failed:", err);
            setError("Failed to load plans. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                setError("Please fill all fields");
                return;
            }
            if (!formData.acceptedTerms) {
                setError("Please accept Terms & Conditions");
                return;
            }
        } else if (step === 2) {
            if (!formData.selectedPlan) {
                setError("Please select a plan");
                return;
            }
        } else if (step === 3) {
            if (!formData.phone) {
                setError("Phone number is required");
                return;
            }
        }
        setError(null);
        setStep((s) => (s + 1) as Step);
    };

    const handleBack = () => {
        if (step > 1) setStep((s) => (s - 1) as Step);
        else router.back();
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const payload = {
                plan: formData.selectedPlan?.type || "BASIC",
                billingCycle: "MONTHLY",
                description: formData.description || `New registration for ${formData.firstName}`,
                contactName: `${formData.firstName} ${formData.lastName}`,
                contactEmail: formData.email,
                contactPhone: formData.phone,
            };

            const res = await apiPublic.post("/subscription-requests", payload);
            if (res.data.success || res.status === 201 || res.status === 200) {
                setStep(5);
            } else {
                setError(res.data.message || "Something went wrong");
            }
        } catch (err: any) {
            console.error("Signup submission failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to send request. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Render Helpers ─────────────────────────────────────────────────────────

    const renderStepIndicator = () => (
        <View style={s.stepIndicatorRow}>
            {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                    <View style={[s.stepDot, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }, step >= i && { backgroundColor: C.primary[scheme] }]} />
                    {i < 4 && <View style={[s.stepLine, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }, step > i && { backgroundColor: C.primary[scheme] }]} />}
                </React.Fragment>
            ))}
        </View>
    );

    const Step1Account = () => (
        <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: C.text[scheme] }]}>Create Account</Text>
            <Text style={[s.stepSubtitle, { color: C.secondary[scheme] }]}>Basic details for your account</Text>

            <View style={s.row}>
                <View style={[s.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>First Name</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        placeholder="John"
                        placeholderTextColor={C.secondary[scheme]}
                        value={formData.firstName}
                        onChangeText={(v) => setFormData({ ...formData, firstName: v })}
                    />
                </View>
                <View style={[s.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[s.label, { color: C.text[scheme] }]}>Last Name</Text>
                    <TextInput
                        style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                        placeholder="Doe"
                        placeholderTextColor={C.secondary[scheme]}
                        value={formData.lastName}
                        onChangeText={(v) => setFormData({ ...formData, lastName: v })}
                    />
                </View>
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Email Address</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    placeholder="john@example.com"
                    placeholderTextColor={C.secondary[scheme]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(v) => setFormData({ ...formData, email: v })}
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Password</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    placeholder="••••••••"
                    placeholderTextColor={C.secondary[scheme]}
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v) => setFormData({ ...formData, password: v })}
                />
            </View>

            <TouchableOpacity
                style={s.checkRow}
                onPress={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}
            >
                <View style={[s.checkbox, { borderColor: C.border[scheme] }, formData.acceptedTerms && { backgroundColor: C.primary[scheme], borderColor: C.primary[scheme] }]}>
                    {formData.acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={[s.checkText, { color: C.secondary[scheme] }]}>I agree to the Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: C.primary[scheme] }]} onPress={handleNext}>
                <Text style={s.primaryBtnText}>Choose Plan</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const Step2Plan = () => (
        <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: C.text[scheme] }]}>Choose a Plan</Text>
            <Text style={[s.stepSubtitle, { color: C.secondary[scheme] }]}>Select the best fit for your business</Text>

            {loading ? (
                <ActivityIndicator size="large" color={C.primary[scheme]} style={{ marginVertical: 40 }} />
            ) : (
                <ScrollView style={s.plansScroll} showsVerticalScrollIndicator={false}>
                    {plans.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            style={[s.planCard, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }, formData.selectedPlan?.id === p.id && { backgroundColor: C.primary[scheme], borderColor: C.primary[scheme] }]}
                            onPress={() => setFormData({ ...formData, selectedPlan: p })}
                        >
                            <View style={s.planHeader}>
                                <Text style={[s.planName, { color: C.text[scheme] }, formData.selectedPlan?.id === p.id && s.whiteText]}>
                                    {p.name}
                                </Text>
                                <Text style={[s.planPrice, { color: C.primary[scheme] }, formData.selectedPlan?.id === p.id && s.whiteText]}>
                                    ${p.price}/mo
                                </Text>
                            </View>
                            {p.features?.map((f, idx) => (
                                <View key={idx} style={s.featureRow}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color={formData.selectedPlan?.id === p.id ? "#fff" : "#10b981"}
                                    />
                                    <Text style={[s.featureText, { color: C.secondary[scheme] }, formData.selectedPlan?.id === p.id && s.whiteText]}>
                                        {f}
                                    </Text>
                                </View>
                            ))}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: C.primary[scheme] }]} onPress={handleNext}>
                <Text style={s.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );

    const Step3Contact = () => (
        <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: C.text[scheme] }]}>Business Info</Text>
            <Text style={[s.stepSubtitle, { color: C.secondary[scheme] }]}>How should we contact you?</Text>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Contact Name</Text>
                <TextInput
                    style={[s.input, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9", color: C.text[scheme], borderColor: C.border[scheme] }]}
                    value={`${formData.firstName} ${formData.lastName}`}
                    editable={false}
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Contact Number (Phone)</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme] }]}
                    placeholder="0311-1234567"
                    placeholderTextColor={C.secondary[scheme]}
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(v) => setFormData({ ...formData, phone: v })}
                />
            </View>

            <View style={s.inputGroup}>
                <Text style={[s.label, { color: C.text[scheme] }]}>Business Description (Optional)</Text>
                <TextInput
                    style={[s.input, { backgroundColor: C.inputBg[scheme], color: C.text[scheme], borderColor: C.border[scheme], height: 100, textAlignVertical: "top" }]}
                    placeholder="Tell us about your restaurant..."
                    placeholderTextColor={C.secondary[scheme]}
                    multiline
                    value={formData.description}
                    onChangeText={(v) => setFormData({ ...formData, description: v })}
                />
            </View>

            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: C.primary[scheme] }]} onPress={handleNext}>
                <Text style={s.primaryBtnText}>Review Details</Text>
            </TouchableOpacity>
        </View>
    );

    const Step4Review = () => (
        <View style={s.stepContent}>
            <Text style={[s.stepTitle, { color: C.text[scheme] }]}>Review & Confirm</Text>
            <Text style={[s.stepSubtitle, { color: C.secondary[scheme] }]}>Double check details before sending</Text>

            <View style={[s.reviewCard, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                <View style={[s.reviewRow, { borderBottomColor: C.border[scheme] }]}>
                    <Text style={s.reviewLabel}>Merchant</Text>
                    <Text style={[s.reviewValue, { color: C.text[scheme] }]}>{formData.firstName} {formData.lastName}</Text>
                </View>
                <View style={[s.reviewRow, { borderBottomColor: C.border[scheme] }]}>
                    <Text style={s.reviewLabel}>Email</Text>
                    <Text style={[s.reviewValue, { color: C.text[scheme] }]}>{formData.email}</Text>
                </View>
                <View style={[s.reviewRow, { borderBottomColor: C.border[scheme] }]}>
                    <Text style={s.reviewLabel}>Selected Plan</Text>
                    <Text style={[s.reviewValue, { color: C.primary[scheme] }]}>
                        {formData.selectedPlan?.name} (${formData.selectedPlan?.price}/mo)
                    </Text>
                </View>
                <View style={[s.reviewRow, { borderBottomColor: C.border[scheme] }]}>
                    <Text style={s.reviewLabel}>Phone</Text>
                    <Text style={[s.reviewValue, { color: C.text[scheme] }]}>{formData.phone}</Text>
                </View>
            </View>

            <View style={[s.warningBox, { backgroundColor: isDark ? "#1e1b4b" : "#eef2ff" }]}>
                <Ionicons name="information-circle" size={20} color={C.primary[scheme]} />
                <Text style={[s.warningText, { color: C.primary[scheme] }]}>
                    Requests are approved typically within 24 hours.
                </Text>
            </View>

            <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: C.primary[scheme] }, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={s.primaryBtnText}>Confirm & Send Request</Text>
                        <Ionicons name="send" size={18} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    const Step5Success = () => (
        <View style={[s.stepContent, { alignItems: "center", justifyContent: "center", paddingTop: 40 }]}>
            <Ionicons name="checkmark-circle" size={100} color="#10b981" />
            <Text style={[s.stepTitle, { marginTop: 24, color: C.text[scheme] }]}>Request Sent!</Text>
            <Text style={[s.stepSubtitle, { textAlign: "center", color: C.secondary[scheme] }]}>
                Your request has been submitted. Expect an email soon.
            </Text>

            <TouchableOpacity
                style={[s.primaryBtn, { width: "100%", marginTop: 40, backgroundColor: C.primary[scheme] }]}
                onPress={() => router.replace("/(auth)/sign-in")}
            >
                <Text style={s.primaryBtnText}>Go to Sign In</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[s.container, { backgroundColor: C.screenBg[scheme] }]}>
            <View style={[s.header, { borderBottomColor: C.border[scheme] }]}>
                <TouchableOpacity style={[s.backCircle, { backgroundColor: C.cardBg[scheme] }]} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
                {step < 5 && renderStepIndicator()}
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                    {error && (
                        <View style={s.errorBadge}>
                            <Text style={s.errorText}>{error}</Text>
                        </View>
                    )}

                    {step === 1 && Step1Account()}
                    {step === 2 && Step2Plan()}
                    {step === 3 && Step3Contact()}
                    {step === 4 && Step4Review()}
                    {step === 5 && Step5Success()}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: Platform.OS === "ios" ? 60 : 50,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    stepIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    stepDot: { width: 10, height: 10, borderRadius: 5 },
    stepLine: { width: 20, height: 2 },

    scroll: { padding: 24, paddingBottom: 60 },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 28, fontWeight: "900", marginBottom: 8 },
    stepSubtitle: { fontSize: 15, lineHeight: 22, marginBottom: 32 },

    row: { flexDirection: "row" },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 2 },
    input: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        fontWeight: "600",
    },

    checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 30, gap: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    checkText: { fontSize: 14, fontWeight: "600" },

    primaryBtn: {
        height: 60,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "800" },

    plansScroll: { maxHeight: width * 1.2, marginBottom: 20 },
    planCard: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 2,
        marginBottom: 16,
    },
    planHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    planName: { fontSize: 20, fontWeight: "900" },
    planPrice: { fontSize: 20, fontWeight: "900" },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    featureText: { fontSize: 14, fontWeight: "600" },
    whiteText: { color: "#fff" },

    reviewCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    reviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    reviewLabel: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
    reviewValue: { fontSize: 14, fontWeight: "700" },

    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    warningText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },

    errorBadge: {
        backgroundColor: "#fef2f2",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#fee2e2",
    },
    errorText: { color: "#b91c1c", fontWeight: "700", textAlign: "center", fontSize: 13 },
});
