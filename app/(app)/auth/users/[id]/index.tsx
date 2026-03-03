import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface UserDetail {
  name: string;
  email: string;
  phone: string;
  role: string;
  warehouse: string;
  status: 0 | 1;
}

export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${id}?includeDeleted=true`);
      const u = res?.data?.data;

      const mapped: UserDetail = {
        name: u.Name,
        email: u.Email,
        phone: u.PhoneNumber,
        role: u.UserRole?.[0]?.Role?.Name || "---",
        warehouse: u.Warehouse?.name || "---",
        status: u.Status,
      };

      setUser(mapped);
    } catch (e) {
      console.log("Error loading user", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </Pressable>

        <Text style={styles.title}>User Details</Text>

        <View style={{ width: 32 }} />
      </View>

      {/* 📦 CARD */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{user.name}</Text>
          <View
            style={[
              styles.statusBadge,
              user.status === 1 ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.statusText}>
              {user.status === 1 ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Info label="Email" value={user.email} icon="mail-outline" />
        <Info label="Phone" value={user.phone} icon="call-outline" />
        <Info label="Role" value={user.role} icon="person-outline" />
        <Info
          label="Warehouse"
          value={user.warehouse}
          icon="home-outline"
        />
      </View>
    </View>
  );
}

/* 🔹 INFO ROW COMPONENT */
const Info = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#0284C7" />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "---"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  backBtn: {
    padding: 6,
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  active: {
    backgroundColor: "#DCFCE7",
  },

  inactive: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },

  /* INFO */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 2,
  },
});
