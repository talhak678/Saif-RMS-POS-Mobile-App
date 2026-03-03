import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

interface Role {
  Id: number;
  Name: string;
}

interface Workspace {
  Id: number;
  Name: string;
}

export default function AddUserScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: null as number | null,
    WorkspaceId: null as number | null,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH WORKSPACES & ROLES ---------------- */
  const fetchWorkspaces = async () => {
    try {
      const res = await apiClient.get("/workspaces?page=1&limit=50");
      setWorkspaces(res.data.data || []);
      if (res.data.data.length > 0) {
        setForm(prev => ({ ...prev, WorkspaceId: res.data.data[0].Id }));
        fetchRoles(res.data.data[0].Id);
      }
    } catch {
      Alert.alert("Error", "Failed to fetch workspaces");
    }
  };

  const fetchRoles = async (workspaceId?: number) => {
    try {
      const url = workspaceId ? `/roles?workspaceId=${workspaceId}&status=1&page=1&limit=10` : "/roles?status=1&page=1&limit=10";
      const res = await apiClient.get(url);
      setRoles(res.data.data || []);
      if (res.data.data.length > 0) {
        setForm(prev => ({ ...prev, roleId: res.data.data[0].Id }));
      }
    } catch {
      Alert.alert("Error", "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Example: check if user is global workspace admin
    const userWorkspaceCode = "GLOBAL"; // fetch from auth
    if (userWorkspaceCode === process.env.NEXT_PUBLIC_GLOBAL_WORKSPACE) {
      setShowWorkspaces(true);
      fetchWorkspaces();
    } else {
      fetchRoles();
      setLoading(false);
    }
  }, []);

  /* ---------------- INPUT HANDLER ---------------- */
  const handleInput = (key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    console.log("hfjhsdjkfb");
    
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword || !form.roleId) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    if (form.password.length < 8) {
      Alert.alert("Validation Error", "Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    if (showWorkspaces && !form.WorkspaceId) {
      Alert.alert("Validation Error", "Workspace is required");
      return;
    }

    setSaving(true);

    try {
      // Step 1: Create user
      const payload: any = {
        name: form.name,
        email: form.email,
        phoneNumber: form.phone,
        passwordHash: form.password,
        status: 1,
        ...(showWorkspaces && { WorkspaceId: form.WorkspaceId }),
      };

      const userRes = await apiClient.post("/users", payload);
      const userId = userRes.data.data?.Id;

      if (!userId) throw new Error("Failed to get created user ID");

      // Step 2: Assign role
      await apiClient.post("/user-roles", {
        userId,
        roleId: form.roleId,
        status: 1,
      });

      Alert.alert("Success", "User created successfully");
      router.replace(("/auth/users") as any);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err.message || "Something went wrong");
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0284C7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add User</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.section}>Basic Information</Text>
        <Input label="Name *" value={form.name} onChangeText={(v:any) => handleInput("name", v)} />
        <Input label="Email *" value={form.email} keyboardType="email-address" onChangeText={(v:any) => handleInput("email", v)} />
        <Input label="Phone *" value={form.phone} onChangeText={(v:any) => handleInput("phone", v)} />

        {showWorkspaces && (
          <>
            <Text style={styles.section}>Workspace</Text>
            {workspaces.map(w => (
              <TouchableOpacity
                key={w.Id}
                style={[styles.roleItem, form.WorkspaceId === w.Id && styles.roleActive]}
                onPress={() => {
                  handleInput("WorkspaceId", w.Id);
                  fetchRoles(w.Id);
                }}
              >
                <Text>{w.Name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={styles.section}>Role *</Text>
        {roles.map(r => (
          <TouchableOpacity
            key={r.Id}
            style={[styles.roleItem, form.roleId === r.Id && styles.roleActive]}
            onPress={() => handleInput("roleId", r.Id)}
          >
            <Text>{r.Name}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}>
          <Text>Show Password</Text>
          <Switch value={showPassword} onValueChange={setShowPassword} style={{ marginLeft: 12 }} />
        </View>

        <Input label="Password *" secure={!showPassword} value={form.password} onChangeText={(v:any) => handleInput("password", v)} />
        <Input label="Confirm Password *" secure={!showPassword} value={form.confirmPassword} onChangeText={(v:any) => handleInput("confirmPassword", v)} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save User</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* 🔹 UI Helpers */
const Input = ({ label, style, ...props }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 4 }}>{label}</Text>
    <TextInput style={[styles.input, style]} placeholderTextColor="#94A3B8" {...props} />
  </View>
);

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backBtn: { backgroundColor: "#E0F2FE", padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  section: { fontSize: 14, fontWeight: "700", color: "#0284C7", marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0F172A" },
  saveBtn: { backgroundColor: "#0284C7", paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#0284C7", shadowOpacity: 0.25, shadowRadius: 10, elevation: 4, zIndex: 10, position: "relative" },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  roleItem: { padding: 12, backgroundColor: "#fff", marginBottom: 6, borderRadius: 8 },
  roleActive: { borderWidth: 1, borderColor: "#0284C7" },
});
