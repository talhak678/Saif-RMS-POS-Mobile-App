import { Colors } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Module Data ──────────────────────────────────────────────────────────────
const modules = [
  {
    title: "Reports",
    icon: "bar-chart-outline" as const,
    color: "#5d69b9",
    bg: "#EEF0FB",
    route: "/reports",
  },
  {
    title: "Customers & Orders",
    icon: "people-outline" as const,
    color: "#f97316",
    bg: "#FFF7ED",
    children: [
      { title: "Incoming Orders", icon: "receipt-outline" as const, route: "/orders/incoming" },
      { title: "Customers", icon: "people-outline" as const, route: "/orders/customers" },
      { title: "Order History", icon: "time-outline" as const, route: "/orders/history" },
    ],
  },
  {
    title: "Riders",
    icon: "bicycle-outline" as const,
    color: "#0d9488",
    bg: "#F0FDFA",
    route: "/riders",
  },
  {
    title: "Menu & Categories",
    icon: "restaurant-outline" as const,
    color: "#8b5cf6",
    bg: "#F5F3FF",
    children: [
      { title: "Categories", icon: "grid-outline" as const, route: "/menu/categories" },
      { title: "Menu Items", icon: "fast-food-outline" as const, route: "/menu/items" },
    ],
  },
  {
    title: "Inventory & Recipes",
    icon: "layers-outline" as const,
    color: "#0891b2",
    bg: "#ECFEFF",
    children: [
      { title: "Inventory", icon: "cube-outline" as const, route: "/inventory" },
      { title: "Recipes", icon: "flask-outline" as const, route: "/inventory/recipes" },
      { title: "Stock", icon: "archive-outline" as const, route: "/inventory/stock" },
    ],
  },
  {
    title: "Settings",
    icon: "settings-outline" as const,
    color: "#64748b",
    bg: "#F8FAFC",
    route: "/settings",
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function NavigationScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Modules</Text>
        <Text style={[styles.subHeading, { color: colors.secondary }]}>Select a module to navigate</Text>
      </View>

      {/* Module Cards */}
      {modules.map((mod, index) => {
        const hasChildren = !!mod.children;
        const isOpen = openIndex === index;

        return (
          <View key={index} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Parent Row */}
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() =>
                hasChildren ? toggle(index) : router.push((mod as any).route)
              }
            >
              <View style={styles.left}>
                <View style={[styles.iconWrap, { backgroundColor: isDark ? mod.color + '20' : mod.bg }]}>
                  <Ionicons name={mod.icon} size={22} color={mod.color} />
                </View>
                <Text style={[styles.modTitle, { color: colors.text }]}>{mod.title}</Text>
              </View>

              <View style={styles.rightWrap}>
                {hasChildren ? (
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.secondary}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.secondary}
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Sub-modules */}
            {hasChildren && isOpen && (
              <View style={[styles.children, { borderTopColor: colors.border, backgroundColor: isDark ? colors.background : '#FAFBFF' }]}>
                {mod.children!.map((child, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.childRow,
                      i < mod.children!.length - 1 && [styles.childBorder, { borderBottomColor: colors.border }],
                    ]}
                    onPress={() => router.push(child.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.childIcon, { backgroundColor: isDark ? mod.color + '20' : mod.bg }]}>
                      <Ionicons name={child.icon} size={16} color={mod.color} />
                    </View>
                    <Text style={[styles.childText, { color: colors.text }]}>{child.title}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.secondary}
                      style={{ marginLeft: "auto" }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Bottom padding for floating tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingTop: 52,
  },

  // Header
  header: { marginBottom: 20 },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.light.text,
    letterSpacing: 0.3,
  },
  subHeading: {
    fontSize: 13,
    color: Colors.light.secondary,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  modTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
  },
  rightWrap: {
    width: 28,
    alignItems: "flex-end",
  },

  // Sub-modules
  children: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: "#FAFBFF",
  },
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  childBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  childIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  childText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
});
