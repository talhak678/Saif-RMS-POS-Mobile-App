import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

/* Enable animation on Android */
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* 🔹 MODULES DATA */
const modules = [
  {
    title: "Companies Management",
    icon: "business-outline",
    children: [
      { title: "Companies", route: "/company" },
      { title: "Facilities", route: "/company/facilities" },
    ],
  },
  {
    title: "Warehouse Management",
    icon: "home-outline",
    route: "/warehouse",
  },
  {
    title: "Authentication",
    icon: "lock-closed-outline",
    children: [
      { title: "User Management", route: "/auth/users" },
      { title: "Role Management", route: "/auth/roles" },
    ],
  },
  {
    title: "Product Management",
    icon: "cube-outline",
    route: "/products",
  },
  {
    title: "Inventory & Vendors",
    icon: "layers-outline",
    route: "/inventory",
  },
  {
    title: "Customers & Orders",
    icon: "people-outline",
    route: "/orders",
  },
  {
    title: "Delivery & Returns",
    icon: "car-outline",
    route: "/delivery",
  },
  {
    title: "Container Unit",
    icon: "file-tray-stacked-outline",
    route: "/containers",
  },
  {
    title: "Fulfilment & Storage",
    icon: "storefront-outline",
    route: "/fulfilment",
  },
];

export default function NavigationScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    LayoutAnimation.easeInEaseOut();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Modules</Text>
        <Text style={styles.subHeading}>
          Select a module to continue
        </Text>
      </View>

      {/* Modules List */}
      {modules.map((item, index) => {
        const hasChildren = !!item.children;
        const isOpen = openIndex === index;

        return (
          <View key={index} style={styles.card}>
            {/* Parent */}
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.85}
              onPress={() =>
                hasChildren
                  ? toggle(index)
                  : router.push(item.route as any)
              }
            >
              <View style={styles.left}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color="#0284C7"
                  />
                </View>
                <Text style={styles.title}>{item.title}</Text>
              </View>

              {hasChildren && (
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#64748B"
                />
              )}
            </TouchableOpacity>

            {/* Sub Modules */}
            {hasChildren && isOpen && (
              <View style={styles.children}>
                {item.children!.map((child, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.childRow}
                    onPress={() => router.push(child.route as any)}
                  >
                    <Ionicons
                      name="ellipse"
                      size={8}
                      color="#0284C7"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.childText}>
                      {child.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },

  header: {
    marginBottom: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },

  subHeading: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  children: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 6,
  },

  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  childText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
});
