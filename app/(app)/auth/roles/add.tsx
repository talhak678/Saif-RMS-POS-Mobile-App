import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------------- TYPES ---------------- */
interface Claim {
  claimType: string;
  claimValue: string;
}

/* ---------------- DATA ---------------- */
const mobilePageOptions = {
  inbound: ["receiving", "putaway"],
  transactions: ["picking", "packing", "dispatch"],
  inquiry: ["items_inquiry", "location_inquiry"],
};

const webPageOptions = [
  "dashboard",
  "company",
  "warehouse",
  "product",
  "orders",
  "role_management",
  "user_management",
];

/* ---------------- SCREEN ---------------- */
export default function AddRoleScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    isMobile: false,
    isWeb: false,
    claims: [] as Claim[],
  });

  const [saving, setSaving] = useState(false);

  /* ---------------- HELPERS ---------------- */
  const toggleClaim = (value: string) => {
    setForm(prev => {
      const exists = prev.claims.find(c => c.claimValue === value);
      return {
        ...prev,
        claims: exists
          ? prev.claims.filter(c => c.claimValue !== value)
          : [...prev.claims, { claimType: "permission", claimValue: value }],
      };
    });
  };

  const isChecked = (value: string) =>
    form.claims.some(c => c.claimValue === value);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!form.name) {
      Alert.alert("Validation Error", "Role name is required");
      return;
    }

    if (!form.isMobile && !form.isWeb) {
      Alert.alert("Validation Error", "Select at least one role type");
      return;
    }

    setSaving(true);
    try {
      await apiClient.post("/roles", {
        name: form.name,
        description: form.description,
        isMobile: form.isMobile,
        isWeb: form.isWeb,
        status: 1,
        claims: form.claims,
      });

      Alert.alert("Success", "Role created successfully");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Role</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.card}>
        {/* BASIC INFO */}
        <Text style={styles.section}>Basic Information</Text>
        <Input label="Role Name *" value={form.name} onChangeText={(v:any) => setForm(p => ({ ...p, name: v }))} />
        <Input label="Description" value={form.description} onChangeText={(v:any) => setForm(p => ({ ...p, description: v }))} />

        {/* ROLE TYPE */}
        <Text style={styles.section}>Role Type</Text>
        <Toggle label="Mobile Role" value={form.isMobile} onChange={(v:any) => setForm(p => ({ ...p, isMobile: v }))} />
        <Toggle label="Web Role" value={form.isWeb} onChange={(v:any) => setForm(p => ({ ...p, isWeb: v }))} />

        {/* MOBILE PERMISSIONS */}
        {form.isMobile && (
          <>
            <Text style={styles.section}>Mobile Permissions</Text>
            {Object.entries(mobilePageOptions).map(([group, items]) => (
              <View key={group}>
                <Text style={styles.group}>{group.toUpperCase()}</Text>
                {items.map(i => (
                  <CheckItem key={i} label={i} checked={isChecked(i)} onPress={() => toggleClaim(i)} />
                ))}
              </View>
            ))}
          </>
        )}

        {/* WEB PERMISSIONS */}
        {form.isWeb && (
          <>
            <Text style={styles.section}>Web Permissions</Text>
            {webPageOptions.map(i => (
              <CheckItem key={i} label={i} checked={isChecked(i)} onPress={() => toggleClaim(i)} />
            ))}
          </>
        )}

        {/* SAVE */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Role</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------------- COMPONENTS ---------------- */
const Input = ({ label, ...props }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
  </View>
);

const Toggle = ({ label, value, onChange }: any) => (
  <View style={styles.toggleRow}>
    <Text>{label}</Text>
    <Switch value={value} onValueChange={onChange} />
  </View>
);

const CheckItem = ({ label, checked, onPress }: any) => (
  <TouchableOpacity style={styles.checkItem} onPress={onPress}>
    <Ionicons
      name={checked ? "checkbox" : "square-outline"}
      size={20}
      color="#0284C7"
    />
    <Text style={{ marginLeft: 8 }}>{label}</Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backBtn: { backgroundColor: "#E0F2FE", padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },

  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16 },
  section: { fontSize: 14, fontWeight: "700", color: "#0284C7", marginVertical: 10 },
  group: { fontSize: 12, fontWeight: "600", color: "#475569", marginTop: 6 },

  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12 },

  toggleRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  checkItem: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },

  saveBtn: { backgroundColor: "#0284C7", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 20 },
  saveText: { color: "#fff", fontWeight: "700" },
});
