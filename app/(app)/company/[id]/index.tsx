import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../../../src/api/apiClient";

interface Company {
  name: string;
  taxId: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  status: number;
}

export default function CompanyDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get(`/companies/${id}`);
      const company = res?.data?.data || {};

      setData({
        name: company.name || "",
        taxId: company.taxId || "",
        contactPerson: company.contactPerson || "",
        contactNumber: company.contactNumber || "",
        email: company.email || "",
        country: company.country || "",
        state: company.state || "",
        city: company.city || "",
        address: company.address || "",
        latitude: company.latitude || "0",
        longitude: company.longitude || "0",
        status: company.status || 1,
      });
    } catch (e) {
      console.log("Error loading company");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </TouchableOpacity>

        <Text style={styles.heading}>Company Details</Text>

        <View style={{ width: 32 }} />
      </View>

      {/* 🏢 BASIC INFO */}
      <View style={styles.card}>
        <SectionTitle title="Basic Information" />
        <Info label="Company Name" value={data.name} />
        <Info label="Tax ID" value={data.taxId} />
        <Info label="Status" value={data.status === 1 ? "Active" : "Inactive"} />
      </View>

      {/* 📞 CONTACT */}
      <View style={styles.card}>
        <SectionTitle title="Contact Information" />
        <Info label="Contact Person" value={data.contactPerson} />
        <Info label="Phone" value={data.contactNumber} />
        <Info label="Email" value={data.email} />
      </View>

      {/* 📍 ADDRESS */}
      <View style={styles.card}>
        <SectionTitle title="Address Details" />
        <Info label="Country" value={data.country} />
        <Info label="State" value={data.state} />
        <Info label="City" value={data.city} />
        <Info label="Address" value={data.address} />
      </View>
    </ScrollView>
  );
}

/* 🔹 Inline Components */
const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backBtn: {
    backgroundColor: "#E0F2FE",
    padding: 8,
    borderRadius: 12,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0284C7",
    marginBottom: 10,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
});
