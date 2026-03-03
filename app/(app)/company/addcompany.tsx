import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import apiClient from "../../../src/api/apiClient";

export default function AddCompanyScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    contactNumber: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    taxId: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key: string, value: string) =>
    setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.contactNumber || !form.country || !form.state) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    const payload = {
      ...form,
      status: 1,
      latitude: null,
      longitude: null,
    };

    try {
      setLoading(true);
      await apiClient.post("/companies", payload);
      Alert.alert("Success", "Company added successfully");
      router.back();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Company</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 🧾 FORM CARD */}
      <View style={styles.card}>
        <Section title="Basic Information" />
        <Input label="Company Name *" value={form.name} onChangeText={(v:any) => onChange("name", v)} />
        <Input label="Tax ID" value={form.taxId} onChangeText={(v:any) => onChange("taxId", v)} />

        <Section title="Contact Details" />
        <Input label="Contact Person" value={form.contactPerson} onChangeText={(v:any) => onChange("contactPerson", v)} />
        <Input label="Email *" keyboardType="email-address" value={form.email} onChangeText={(v:any) => onChange("email", v)} />
        <Input label="Contact Number *" value={form.contactNumber} onChangeText={(v:any) => onChange("contactNumber", v)} />

        <Section title="Address" />
        <Input label="Country *" value={form.country} onChangeText={(v:any) => onChange("country", v)} />
        <Input label="State *" value={form.state} onChangeText={(v:any) => onChange("state", v)} />
        <Input label="City" value={form.city} onChangeText={(v:any) => onChange("city", v)} />
        <Input label="Zip Code" value={form.zipCode} onChangeText={(v:any) => onChange("zipCode", v)} />
        <Input
          label="Address"
          value={form.address}
          multiline
          style={{ height: 90, textAlignVertical: "top" }}
          onChangeText={(v:any) => onChange("address", v)}
        />
      </View>

      {/* 💾 SAVE */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Company</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 🔹 UI Helpers */
const Section = ({ title }: { title: string }) => (
  <Text style={styles.section}>{title}</Text>
);

const Input = ({ label, style, ...props }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#94A3B8"
      {...props}
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
    marginTop: 12,
    marginBottom: 6,
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
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
