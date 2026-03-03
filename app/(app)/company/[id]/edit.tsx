import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../../../src/api/apiClient";

export default function EditCompanyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    contactNumber: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    taxId: "",
  });

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get(`/companies/${id}`);
      const data = res?.data?.data || {};

      setForm({
        name: data.name || "",
        contactPerson: data.contactPerson || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        address: data.address || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        zipCode: data.zipCode || "",
        taxId: data.taxId || "",
      });
    } catch {
      Alert.alert("Error", "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/companies/${id}`, form);
      Alert.alert("Success", "Company updated successfully");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Company</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 🧾 FORM */}
      <View style={styles.card}>
        <Section title="Basic Information" />
        <Input label="Company Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Tax ID" value={form.taxId} onChange={(v) => setForm({ ...form, taxId: v })} />

        <Section title="Contact Information" />
        <Input label="Contact Person" value={form.contactPerson} onChange={(v) => setForm({ ...form, contactPerson: v })} />
        <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Contact Number" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} />

        <Section title="Address Details" />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <Input label="Zip Code" value={form.zipCode} onChange={(v) => setForm({ ...form, zipCode: v })} />
      </View>

      {/* 💾 SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 🔹 Components */
const Section = ({ title }: { title: string }) => (
  <Text style={styles.section}>{title}</Text>
);

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={styles.input}
      placeholderTextColor="#94A3B8"
    />
  </View>
);

/* 🎨 STYLES */
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

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  section: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0284C7",
    marginBottom: 8,
    marginTop: 12,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },

  saveBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#0284C7",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
