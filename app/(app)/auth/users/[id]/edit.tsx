import apiClient from "@/src/api/apiClient";
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
      // Merge original user data with edited fields
      const payload = {
        ...originalUser,
        id: form.id,
        Name: form.name,
        Email: form.email,
        PhoneNumber: form.phone,
        ...(changePassword && form.password ? { PasswordHash: form.password } : {}),
      };

      await apiClient.put(`/users/${id}`, payload);

      // Update role if changed
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

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit User</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {error && <Text style={styles.error}>{error}</Text>}

        <Input label="Name" value={form.name} onChange={(v:any) => setForm({ ...form, name: v })} />
        <Input label="Email" value={form.email} onChange={(v:any) => setForm({ ...form, email: v })} />
        <Input label="Phone" value={form.phone} onChange={(v:any) => setForm({ ...form, phone: v })} />

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
            <Text>{r.Name}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.switchRow}>
          <Text>Change Password</Text>
          <Switch value={changePassword} onValueChange={setChangePassword} />
        </View>

        {changePassword && (
          <>
            <Input
              label="Current Password"
              secure
              value={currentPassword}
              onChange={setCurrentPassword}
              onBlur={verifyPassword}
            />

            {passwordVerified && (
              <>
                <Input
                  label="New Password"
                  secure
                  value={form.password}
                  onChange={(v:any) => setForm({ ...form, password: v })}
                />
                <Input
                  label="Confirm Password"
                  secure
                  value={form.confirmPassword}
                  onChange={(v:any) => setForm({ ...form, confirmPassword: v })}
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

/* ---------------- REUSABLE INPUT ---------------- */
const Input = ({
  label,
  value,
  onChange,
  secure,
  onBlur,
}: any) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      secureTextEntry={secure}
      onChangeText={onChange}
      onBlur={onBlur}
      style={styles.input}
    />
  </View>
);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  back: { color: "#0284C7" },
  title: { fontSize: 18, fontWeight: "700", marginLeft: 16 },

  form: { padding: 16 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
  },

  roleItem: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 6,
    borderRadius: 8,
  },
  roleActive: { borderWidth: 1, borderColor: "#0284C7" },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },

  btn: {
    backgroundColor: "#0284C7",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  btnText: { color: "#fff", fontWeight: "600" },

  error: { color: "red", marginBottom: 10 },
});
