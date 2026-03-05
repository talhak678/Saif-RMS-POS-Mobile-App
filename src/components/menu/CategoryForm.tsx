import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { ICategoryForm } from "@/types/category.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    initial?: ICategoryForm;
    onSubmit: (form: ICategoryForm) => Promise<void>;
    onClose: () => void;
    title: string;
    submitLabel: string;
}

export default function CategoryForm({ initial, onSubmit, onClose, title, submitLabel }: Props) {
    const { colors, isDark } = useTheme();
    const [form, setForm] = useState<ICategoryForm>(initial ?? { name: "", description: "", image: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        if (initial) setForm(initial);
    }, [initial]);

    const handleSubmit = async () => {
        if (!form.name.trim()) { setError("Category name is required"); return; }
        setError("");
        setLoading(true);
        try {
            await onSubmit(form);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field: string) => [
        s.input,
        {
            backgroundColor: isDark ? "#374151" : "#f3f4f6",
            borderColor: focusedField === field ? Colors.primary : colors.border,
            color: colors.text,
        },
    ];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            {/* Header */}
            <View style={[s.header, { borderBottomColor: colors.border }]}>
                <View style={s.handle} />
                <View style={s.headerRow}>
                    <Text style={[s.headerTitle, { color: colors.text }]}>{title}</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
                {/* Name */}
                <Text style={[s.label, { color: colors.text }]}>Category Name <Text style={{ color: "#ef4444" }}>*</Text></Text>
                <TextInput
                    style={inputStyle("name")}
                    value={form.name}
                    onChangeText={v => setForm(f => ({ ...f, name: v }))}
                    placeholder="e.g. Burgers"
                    placeholderTextColor={colors.secondary}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                />
                {error ? (
                    <View style={s.errorRow}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={s.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Description */}
                <Text style={[s.label, { color: colors.text, marginTop: 14 }]}>Description</Text>
                <TextInput
                    style={[inputStyle("desc"), { height: 80, textAlignVertical: "top" }]}
                    value={form.description}
                    onChangeText={v => setForm(f => ({ ...f, description: v }))}
                    placeholder="Optional description…"
                    placeholderTextColor={colors.secondary}
                    onFocus={() => setFocusedField("desc")}
                    onBlur={() => setFocusedField(null)}
                    multiline
                    numberOfLines={3}
                />

                {/* Image URL */}
                <Text style={[s.label, { color: colors.text, marginTop: 14 }]}>Image URL <Text style={{ color: colors.secondary }}>(optional)</Text></Text>
                <TextInput
                    style={inputStyle("img")}
                    value={form.image}
                    onChangeText={v => setForm(f => ({ ...f, image: v }))}
                    placeholder="https://cdn.example.com/image.jpg"
                    placeholderTextColor={colors.secondary}
                    onFocus={() => setFocusedField("img")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="url"
                />
                {form.image.startsWith("http") && (
                    <Image source={{ uri: form.image }} style={s.preview} resizeMode="cover" />
                )}

                {/* Submit */}
                <TouchableOpacity
                    style={[s.submitBtn, { backgroundColor: Colors.primary }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={s.submitText}>{submitLabel}</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#9ca3af", alignSelf: "center", marginTop: 10 },
    header: { borderBottomWidth: 1, paddingBottom: 12 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 14 },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    body: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
    input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
    errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
    errorText: { fontSize: 12, color: "#ef4444", fontWeight: "600" },
    preview: { width: "100%", height: 140, borderRadius: 12, marginTop: 10 },
    submitBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 24 },
    submitText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
