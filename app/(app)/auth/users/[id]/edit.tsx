import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function EditUserScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);

  const [originalUser, setOriginalUser] = useState<any>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    roleId: null as number | null,
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH USER ---------------- */
  const fetchUser = async () => {
    try {
      const res = await apiClient.get(`/users/${id}`);
      const u = res.data.data;

      setForm({
        id: u.Id,
        name: u.Name,
        email: u.Email,
        phone: u.PhoneNumber,
        roleId: u.UserRole?.[0]?.RoleId || null,
        password: "",
        confirmPassword: "",
      });

      setCurrentRoleId(u.UserRole?.[0]?.RoleId || null);

      setOriginalUser(u);
    } catch {
      setError("Failed to load user");
    }
  };

  /* ---------------- FETCH ROLES ---------------- */
  const fetchRoles = async () => {
    try {
      const res = await apiClient.get("/roles?page=1&limit=100&status=1");
      setRoles(res.data.data);
    } catch {
      setError("Failed to load roles");
    }
  };

  useEffect(() => {
    Promise.all([fetchUser(), fetchRoles()]).finally(() =>
      setLoading(false)
    );
  }, []);

  /* ---------------- VERIFY PASSWORD ---------------- */
  const verifyPassword = async () => {
    try {
      const res = await apiClient.post("/auth/login", {
        email: form.email,
        password: currentPassword,
      });
      setPasswordVerified(res.data.success);
      if (!res.data.success) setError("Invalid current password");
    } catch {
      setPasswordVerified(false);
      setError("Invalid current password");
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    setError(null);

    if (!form.name || !form.email || !form.phone || !form.roleId) {
      setError("All required fields must be filled");
      return;
    }

    if (changePassword) {
      if (!passwordVerified) {
        setError("Verify current password first");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    if (!originalUser) {
      setError("User data not loaded");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...originalUser,
        id: form.id,
        Name: form.name,
        Email: form.email,
        PhoneNumber: form.phone,
        ...(changePassword && form.password ? { PasswordHash: form.password } : {}),
      };

      await apiClient.put(`/users/${id}`, payload);

      if (form.roleId !== currentRoleId) {
        await apiClient.put(`/user-roles/${id}?roleid=${form.roleId}`, {});
      }

      router.replace("/auth/users" as any);
    } catch {
      setError("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit User</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {error && <Text style={styles.error}>{error}</Text>}

        <Input label="Name" value={form.name} onChange={(v: any) => setForm({ ...form, name: v })} />
        <Input label="Email" value={form.email} onChange={(v: any) => setForm({ ...form, email: v })} />
        <Input label="Phone" value={form.phone} onChange={(v: any) => setForm({ ...form, phone: v })} />

        <Text style={styles.label}>Role</Text>
        {roles.map((r) => (
          <TouchableOpacity
            key={r.Id}
            style={[
              styles.roleItem,
              form.roleId === r.Id && styles.roleActive,
            ]}
            onPress={() => setForm({ ...form, roleId: r.Id })}
          >
            <Text style={{ color: Colors.light.text }}>{r.Name}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.switchRow}>
          <Text style={{ color: Colors.light.text }}>Change Password</Text>
          <Switch
            value={changePassword}
            onValueChange={setChangePassword}
            trackColor={{ false: "#CBD5E1", true: Colors.primary + "80" }}
            thumbColor={changePassword ? Colors.primary : "#F1F5F9"}
          />
        </View>

        {changePassword && (
          <>
            <Input
              label="Current Password"
              secure={true}
              value={currentPassword}
              onChange={setCurrentPassword}
              onBlur={verifyPassword}
            />

            {passwordVerified && (
              <>
                <Input
                  label="New Password"
                  secure={true}
                  value={form.password}
                  onChange={(v: any) => setForm({ ...form, password: v })}
                />
                <Input
                  label="Confirm Password"
                  secure={true}
                  value={form.confirmPassword}
                  onChange={(v: any) => setForm({ ...form, confirmPassword: v })}
                />
              </>
            )}
          </>
        )}

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const Input = ({
  label,
  value,
  onChange,
  secure,
  onBlur,
}: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      secureTextEntry={secure}
      onChangeText={onChange}
      onBlur={onBlur}
      style={styles.input}
      placeholderTextColor={Colors.light.secondary}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: {
    padding: 8,
    backgroundColor: Colors.primary + "15",
    borderRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "700", marginLeft: 16, color: Colors.light.text },

  form: { padding: 16 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12, fontWeight: "600", color: Colors.light.secondary },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    color: Colors.light.text,
  },

  roleItem: {
    padding: 14,
    backgroundColor: Colors.light.card,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  roleActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + "08" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },

  btn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  error: { color: Colors.error, marginBottom: 16, fontWeight: "600" },
});

