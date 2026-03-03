import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface RoleDetail {
  Name: string;
  Description: string;
  Status: 0 | 1;
  IsWebRole: boolean;
  RoleClaim: { ClaimType: string; ClaimValue: string }[];
}

export default function RoleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/roles/${id}?includeDeleted=true`);
      const r = res?.data?.data;

      const mapped: RoleDetail = {
        Name: r.Name,
        Description: r.Description,
        Status: r.Status,
        IsWebRole: r.IsWebRole,
        RoleClaim: r.RoleClaim || [],
      };

      setRole(mapped);
    } catch (e) {
      console.log("Error loading role", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!role) {
    return (
      <View style={styles.center}>
        <Text>Role not found</Text>
      </View>
    );
  }

  const getStatusText = (status: number) => (status === 1 ? "Active" : "Inactive");

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </Pressable>

        <Text style={styles.title}>Role Details</Text>

        <View style={{ width: 32 }} />
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{role.Name}</Text>
          <View
            style={[
              styles.statusBadge,
              role.Status === 1 ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(role.Status)}</Text>
          </View>
        </View>

        <Info label="Description" value={role.Description} icon="document-text-outline" />
        <Info label="Is Web Role?" value={role.IsWebRole ? "Yes" : "No"} icon="globe-outline" />

        <Text style={styles.sectionTitle}>Role Permissions</Text>
        {role.RoleClaim.length > 0 ? (
          <View style={styles.permissionContainer}>
            {role.RoleClaim.map((claim, index) => (
              <View key={index} style={styles.permissionBadge}>
                <Text style={styles.permissionText}>{claim.ClaimValue}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPermissions}>No permissions assigned</Text>
        )}
      </View>
    </ScrollView>
  );
}

/* 🔹 INFO ROW COMPONENT */
const Info = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#0284C7" />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "---"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { padding: 6, backgroundColor: "#E0F2FE", borderRadius: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#0F172A" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  name: { fontSize: 18, fontWeight: "800", color: "#0F172A", flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  active: { backgroundColor: "#DCFCE7" },
  inactive: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#0F172A" },

  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  infoLabel: { fontSize: 12, color: "#64748B" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, color: "#0F172A" },
  permissionContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  permissionBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  permissionText: { color: "#1D4ED8", fontSize: 12, fontWeight: "600" },
  noPermissions: { fontStyle: "italic", color: "#64748B", marginTop: 6 },
});
