import { Colors } from "@/constants/theme";
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

export default function AddWarehouseScreen() {
  const router = useRouter();

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
  });

  const [loading, setLoading] = useState(false);

  const onChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.code ||
      !form.managerName ||
      !form.managerContactNumber ||
      !form.country ||
      !form.state ||
      !form.city
    ) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      managerName: form.managerName.trim(),
      managerContactNumber: form.managerContactNumber.trim(),
      country: form.country.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      address: form.address.trim() || null,
      latitude: form.latitude || null,
      longitude: form.longitude || null,
      status: 1,
    };

    try {
      setLoading(true);

      const res = await apiClient.post("/warehouses", payload);

      const success =
        res?.status === 200 ||
        res?.status === 201 ||
        res?.data?.success === true ||
        res?.data?.title?.status === 200;

      if (success) {
        Alert.alert("Success", "Warehouse added successfully");
        router.back(); // warehouse list
      } else {
        Alert.alert("Error", "Failed to add warehouse");
      }
    } catch (err: any) {
      console.log("Add warehouse error", err?.response?.data || err.message);

      Alert.alert(
        "Error",
        err?.response?.data?.message ||
        "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.heading}>Add New Warehouse</Text>

      <Input label="Warehouse Name *" value={form.name} onChange={(v: any) => onChange("name", v)} />
      <Input label="Code *" value={form.code} onChange={(v: any) => onChange("code", v)} />
      <Input label="Manager Name *" value={form.managerName} onChange={(v: any) => onChange("managerName", v)} />
      <Input label="Manager Contact *" value={form.managerContactNumber} keyboardType="phone-pad" onChange={(v: any) => onChange("managerContactNumber", v)} />
      <Input label="Country *" value={form.country} onChange={(v: any) => onChange("country", v)} />
      <Input label="State *" value={form.state} onChange={(v: any) => onChange("state", v)} />
      <Input label="City *" value={form.city} onChange={(v: any) => onChange("city", v)} />
      <Input label="Address" value={form.address} multiline onChange={(v: any) => onChange("address", v)} />
      <Input label="Latitude" value={form.latitude} keyboardType="numeric" onChange={(v: any) => onChange("latitude", v)} />
      <Input label="Longitude" value={form.longitude} keyboardType="numeric" onChange={(v: any) => onChange("longitude", v)} />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Warehouse</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 🔹 Reusable Input */
const Input = ({ label, onChange, ...props }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor={Colors.light.secondary}
      onChangeText={onChange}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },

  field: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    color: Colors.light.secondary,
    marginBottom: 6,
    fontWeight: "500",
  },

  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.light.text,
  },

  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  disabled: {
    backgroundColor: "#9CA3AF",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

