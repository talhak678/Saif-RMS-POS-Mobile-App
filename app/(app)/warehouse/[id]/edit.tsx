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

export default function EditWarehouseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    managerName: "",
    managerContactNumber: "",
    country: "",
    state: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    status: 1,
  });

  // 🔹 Fetch warehouse
  const fetchWarehouse = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get(`/warehouses/${id}`);

      const data =
        res?.data?.data ||
        res?.data?.title?.data?.data;

      setForm({
        name: data?.name || "",
        code: data?.code || "",
        managerName: data?.managerName || "",
        managerContactNumber: data?.managerContactNumber || "",
        country: data?.country || "",
        state: data?.state || "",
        city: data?.city || "",
        address: data?.address || "",
        latitude: data?.latitude?.toString() || "",
        longitude: data?.longitude?.toString() || "",
        status: data?.status ?? 1,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to load warehouse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  // 🔹 Update warehouse
  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      };

      await apiClient.put(`/warehouses/${id}`, payload);

      Alert.alert("Success", "Warehouse updated successfully");
      router.back();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Warehouse</Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Input label="Warehouse Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Input label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
        <Input label="Manager Name" value={form.managerName} onChange={(v) => setForm({ ...form, managerName: v })} />
        <Input
          label="Manager Contact"
          value={form.managerContactNumber}
          onChange={(v) => setForm({ ...form, managerContactNumber: v })}
        />
        <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
        <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Input
          label="Latitude"
          value={form.latitude}
          onChange={(v) => setForm({ ...form, latitude: v })}
        />
        <Input
          label="Longitude"
          value={form.longitude}
          onChange={(v) => setForm({ ...form, longitude: v })}
        />
      </View>

      {/* Save */}
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

/* 🔹 Reusable Input */
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
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFF",
  },

  saveBtn: {
    backgroundColor: "#14B8A6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
