import apiClient from "@/src/api/apiClient";
import AddonRow from "@/src/components/menu/AddonRow";
import CategoryPicker from "@/src/components/menu/CategoryPicker";
import VariationRow from "@/src/components/menu/VariationRow";
import { useTheme } from "@/src/context/ThemeContext";
import { C } from "@/theme/colors";
import { ICategory } from "@/types/category.types";
import { IAddon, IMenuItem, IMenuItemForm, IVariation } from "@/types/menuitem.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const EMPTY_FORM: IMenuItemForm = {
    name: "", description: "", price: "", image: "",
    categoryId: "", isAvailable: true, variations: [], addons: [],
};

export default function ItemDetailScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';

    const { id, categoryId: paramCatId } = useLocalSearchParams<{ id: string; categoryId: string }>();
    const isNew = !id || id === "new";

    const [form, setForm] = useState<IMenuItemForm>({ ...EMPTY_FORM, categoryId: paramCatId ?? "" });
    const [variations, setVariations] = useState<IVariation[]>([]);
    const [addons, setAddons] = useState<IAddon[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [showCatPicker, setShowCatPicker] = useState(false);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCategories();
        if (!isNew) fetchItem();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await apiClient.get("/categories");
            if (res.data?.success) setCategories(res.data.data);
        } catch { /* silent */ }
    };

    const fetchItem = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/menu-items");
            if (res.data?.success) {
                const found: IMenuItem = res.data.data.find((i: IMenuItem) => i.id === id);
                if (found) {
                    setForm({
                        name: found.name,
                        description: found.description ?? "",
                        price: String(found.price),
                        image: found.image ?? "",
                        categoryId: found.categoryId,
                        isAvailable: found.isAvailable,
                        variations: found.variations || [],
                        addons: found.addons || [],
                    });
                    setVariations(found.variations || []);
                    setAddons(found.addons || []);
                }
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const validate = () => {
        const err: Record<string, string> = {};
        if (!form.name.trim()) err.name = "Name is required";
        const p = parseFloat(form.price);
        if (!form.price || isNaN(p) || p <= 0) err.price = "Valid price is required";
        if (!form.categoryId) err.categoryId = "Category is required";

        // Validate variations/addons names if present
        variations.forEach((v, idx) => {
            if (!v.name.trim()) err[`var_${idx}`] = "Name required";
        });
        addons.forEach((a, idx) => {
            if (!a.name.trim()) err[`add_${idx}`] = "Name required";
        });

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const buildPayload = () => ({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        image: form.image.trim(),
        categoryId: form.categoryId,
        isAvailable: form.isAvailable,
        variations: variations.map(v => ({
            ...(v.id ? { id: v.id } : {}),
            name: v.name.trim(),
            price: parseFloat(String(v.price)) || 0
        })),
        addons: addons.map(a => ({
            ...(a.id ? { id: a.id } : {}),
            name: a.name.trim(),
            price: parseFloat(String(a.price)) || 0
        })),
    });

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (isNew) {
                await apiClient.post("/menu-items", buildPayload());
            } else {
                await apiClient.put(`/menu-items/${id}`, buildPayload());
            }
            router.back();
        } catch (e: any) {
            Alert.alert("Error", e?.response?.data?.message ?? "Something went wrong");
        } finally { setSaving(false); }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await apiClient.delete(`/menu-items/${id}`);
                            router.back();
                        }
                        catch { Alert.alert("Error", "Failed to delete item"); }
                    }
                },
            ]
        );
    };

    const updateVariation = (i: number, field: "name" | "price", val: string) =>
        setVariations(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: field === "price" ? (parseFloat(val) || 0) : val } : v));
    const removeVariation = (i: number) => setVariations(prev => prev.filter((_, idx) => idx !== i));

    const updateAddon = (i: number, field: "name" | "price", val: string) =>
        setAddons(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: field === "price" ? (parseFloat(val) || 0) : val } : a));
    const removeAddon = (i: number) => setAddons(prev => prev.filter((_, idx) => idx !== i));

    const inputStyle = (field: string) => [
        s.input, {
            backgroundColor: C.inputBg[scheme],
            borderColor: errors[field] ? C.danger[scheme] : focusedField === field ? C.primary[scheme] : C.border[scheme],
            color: C.text[scheme],
        },
    ];

    const selectedCat = categories.find(c => c.id === form.categoryId);

    if (loading) {
        return (
            <View style={[s.root, { backgroundColor: C.screenBg[scheme], alignItems: "center", justifyContent: "center" }]}>
                <ActivityIndicator size="large" color={C.primary[scheme]} />
            </View>
        );
    }

    return (
        <View style={[s.root, { backgroundColor: C.screenBg[scheme] }]}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}
                >
                    <Ionicons name="arrow-back" size={20} color={C.text[scheme]} />
                </TouchableOpacity>

                <Text style={[s.headerTitle, { color: C.text[scheme] }]} numberOfLines={1}>
                    {isNew ? "Add Menu Item" : (form.name || "Edit Item")}
                </Text>

                {!isNew && (
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={[s.backBtn, { backgroundColor: C.dangerLight[scheme], borderColor: C.danger[scheme] }]}
                    >
                        <Ionicons name="trash" size={17} color={C.danger[scheme]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Form ───────────────────────────────────────────────────────────── */}
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Hero image preview */}
                    {form.image && form.image.startsWith("http") ? (
                        <Image source={{ uri: form.image }} style={s.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={[s.heroImagePlaceholder, { backgroundColor: C.inputBg[scheme] }]}>
                            <Ionicons name="image-outline" size={48} color={C.secondary[scheme]} />
                        </View>
                    )}

                    <View style={s.body}>
                        {/* Basic Info Section */}
                        <Text style={[s.sectionLabel, { color: C.secondary[scheme] }]}>Basic Info</Text>

                        <Text style={[s.label, { color: C.text[scheme] }]}>Name *</Text>
                        <TextInput style={inputStyle("name")} value={form.name}
                            onChangeText={v => setForm(f => ({ ...f, name: v }))}
                            placeholder="e.g. Cheese Burger" placeholderTextColor={C.secondary[scheme]}
                            onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} />
                        {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}

                        <Text style={[s.label, { color: C.text[scheme], marginTop: 14 }]}>Description</Text>
                        <TextInput style={[inputStyle("desc"), { height: 90, textAlignVertical: "top" }]}
                            value={form.description}
                            onChangeText={v => setForm(f => ({ ...f, description: v }))}
                            placeholder="Juicy beef patty with melted cheese..." placeholderTextColor={C.secondary[scheme]}
                            multiline numberOfLines={3}
                            onFocus={() => setFocusedField("desc")} onBlur={() => setFocusedField(null)} />

                        <Text style={[s.label, { color: C.text[scheme], marginTop: 14 }]}>Price (Rs.) *</Text>
                        <TextInput style={inputStyle("price")} value={form.price}
                            onChangeText={v => setForm(f => ({ ...f, price: v }))}
                            placeholder="850" placeholderTextColor={C.secondary[scheme]}
                            keyboardType="numeric"
                            onFocus={() => setFocusedField("price")} onBlur={() => setFocusedField(null)} />
                        {errors.price ? <Text style={s.errorText}>{errors.price}</Text> : null}

                        <Text style={[s.label, { color: C.text[scheme], marginTop: 14 }]}>Image URL (optional)</Text>
                        <TextInput style={inputStyle("image")} value={form.image}
                            onChangeText={v => setForm(f => ({ ...f, image: v }))}
                            placeholder="https://cdn.example.com/image.jpg" placeholderTextColor={C.secondary[scheme]}
                            autoCapitalize="none" keyboardType="url"
                            onFocus={() => setFocusedField("image")} onBlur={() => setFocusedField(null)} />

                        <Text style={[s.label, { color: C.text[scheme], marginTop: 14 }]}>Category *</Text>
                        <TouchableOpacity
                            style={[s.input, s.picker, { backgroundColor: C.inputBg[scheme], borderColor: errors.categoryId ? C.danger[scheme] : C.border[scheme] }]}
                            onPress={() => setShowCatPicker(true)}
                        >
                            <Text style={{ color: selectedCat ? C.text[scheme] : C.secondary[scheme], fontSize: 14, flex: 1 }}>
                                {selectedCat ? selectedCat.name : "Select a category…"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color={C.secondary[scheme]} />
                        </TouchableOpacity>
                        {errors.categoryId ? <Text style={s.errorText}>{errors.categoryId}</Text> : null}

                        {/* Availability Section */}
                        <Text style={[s.sectionLabel, { color: C.secondary[scheme], marginTop: 28 }]}>Availability</Text>
                        <View style={[s.availRow, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.availLabel, { color: C.text[scheme] }]}>Available to Order</Text>
                                <Text style={[s.availSub, { color: C.secondary[scheme] }]}>Customers can place orders for this item</Text>
                            </View>
                            <Switch
                                value={form.isAvailable}
                                onValueChange={v => setForm(f => ({ ...f, isAvailable: v }))}
                                trackColor={{ false: C.border[scheme], true: C.primary[scheme] + "80" }}
                                thumbColor={form.isAvailable ? C.primary[scheme] : C.secondary[scheme]}
                            />
                        </View>

                        {/* Variations Section */}
                        <View style={s.sectionHeaderRow}>
                            <Text style={[s.sectionLabel, { color: C.secondary[scheme] }]}>Variations</Text>
                            <TouchableOpacity
                                onPress={() => setVariations(p => [...p, { name: "", price: 0 }])}
                                style={s.addRowBtn}
                            >
                                <Ionicons name="add-circle-outline" size={14} color={C.primary[scheme]} />
                                <Text style={[s.addRowText, { color: C.primary[scheme] }]}>Add Variation</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[s.listContainer, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                            {variations.length === 0 ? (
                                <Text style={[s.noItems, { color: C.secondary[scheme] }]}>No variations added</Text>
                            ) : (
                                variations.map((v, i) => (
                                    <VariationRow key={i} index={i} variation={v} onChange={updateVariation} onRemove={removeVariation} />
                                ))
                            )}
                        </View>

                        {/* Add-ons Section */}
                        <View style={s.sectionHeaderRow}>
                            <Text style={[s.sectionLabel, { color: C.secondary[scheme] }]}>Add-ons</Text>
                            <TouchableOpacity
                                onPress={() => setAddons(p => [...p, { name: "", price: 0 }])}
                                style={s.addRowBtn}
                            >
                                <Ionicons name="add-circle-outline" size={14} color={C.primary[scheme]} />
                                <Text style={[s.addRowText, { color: C.primary[scheme] }]}>Add Add-on</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[s.listContainer, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
                            {addons.length === 0 ? (
                                <Text style={[s.noItems, { color: C.secondary[scheme] }]}>No add-ons added</Text>
                            ) : (
                                addons.map((a, i) => (
                                    <AddonRow key={i} index={i} addon={a} onChange={updateAddon} onRemove={removeAddon} />
                                ))
                            )}
                        </View>

                        {/* Action Buttons */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[s.saveBtn, { backgroundColor: C.primary[scheme] }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={s.saveBtnText}>{isNew ? "Add Item" : "Save Changes"}</Text>
                            )}
                        </TouchableOpacity>

                        {!isNew && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[s.deleteBtn, { borderColor: C.danger[scheme], backgroundColor: C.dangerLight[scheme] }]}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash" size={18} color={C.danger[scheme]} />
                                <Text style={[s.deleteBtnText, { color: C.danger[scheme] }]}>Delete Item</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CategoryPicker
                visible={showCatPicker}
                categories={categories}
                selectedId={form.categoryId}
                onSelect={catId => setForm(f => ({ ...f, categoryId: catId }))}
                onClose={() => setShowCatPicker(false)}
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? 40 : 52,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 14,
        gap: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "800",
    },
    heroImage: {
        width: "100%",
        height: 240,
    },
    heroImagePlaceholder: {
        width: "100%",
        height: 240,
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        padding: 18,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 28,
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: "800",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        marginBottom: 4,
    },
    picker: {
        flexDirection: "row",
        alignItems: "center",
    },
    errorText: {
        fontSize: 12,
        color: "#ef4444",
        fontWeight: "700",
        marginTop: 2,
        marginBottom: 4,
    },
    availRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
    },
    availLabel: {
        fontSize: 15,
        fontWeight: "800",
    },
    availSub: {
        fontSize: 12,
        marginTop: 4,
        lineHeight: 18,
    },
    addRowBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    addRowText: {
        fontSize: 13,
        fontWeight: "800",
    },
    listContainer: {
        borderWidth: 1.5,
        borderRadius: 18,
        padding: 12,
        gap: 10,
    },
    noItems: {
        fontSize: 13,
        fontStyle: "italic",
        textAlign: 'center',
        paddingVertical: 10,
    },
    saveBtn: {
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 32,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 16,
        paddingVertical: 15,
        marginTop: 14,
        borderWidth: 2,
    },
    deleteBtnText: {
        fontSize: 15,
        fontWeight: "900",
    },
});
