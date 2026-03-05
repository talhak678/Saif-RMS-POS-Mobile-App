import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUB_MODULES = [
    {
        title: "Categories",
        desc: "Manage your menu categories",
        icon: "grid-outline" as const,
        color: "#8b5cf6",
        bg: "#F5F3FF",
        darkBg: "#1e1a3a",
        route: "/menu/categories",
    },
    {
        title: "Menu Items",
        desc: "Add, edit & manage all menu items",
        icon: "fast-food-outline" as const,
        color: "#f97316",
        bg: "#FFF7ED",
        darkBg: "#2a1a0a",
        route: "/menu/items",
    },
];

export default function MenuHubScreen() {
    const { colors, isDark } = useTheme();

    return (
        <View style={[s.root, { backgroundColor: colors.background }]}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <View style={s.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[s.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[s.headerTitle, { color: colors.text }]}>Menu & Categories</Text>
                    <Text style={[s.headerSub, { color: colors.secondary }]}>Manage your restaurant menu</Text>
                </View>
            </View>

            {/* ── Sub-module Cards ────────────────────────────────────────────────── */}
            <View style={s.body}>
                {SUB_MODULES.map(mod => (
                    <TouchableOpacity
                        key={mod.route}
                        activeOpacity={0.85}
                        onPress={() => router.push(mod.route as any)}
                        style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <View style={[s.iconWrap, { backgroundColor: isDark ? mod.darkBg : mod.bg }]}>
                            <Ionicons name={mod.icon} size={32} color={mod.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.cardTitle, { color: colors.text }]}>{mod.title}</Text>
                            <Text style={[s.cardDesc, { color: colors.secondary }]}>{mod.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.secondary} />
                    </TouchableOpacity>
                ))}
            </View>
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
        gap: 10,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    headerSub: { fontSize: 12, marginTop: 2 },
    body: { paddingHorizontal: 16, gap: 14 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    cardTitle: { fontSize: 16, fontWeight: "800" },
    cardDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
