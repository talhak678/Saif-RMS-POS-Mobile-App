import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, logout, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await apiClient.put(`/users/${user.id}`, { name });
      if (res.status === 200 || res.data?.success) {
        setUser({ ...user, name });
        setIsEditing(false);
      } else {
        setError("Update failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  // Avatar initials
  const initials = user.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* ── Avatar + Basic Info ──────────────────────────── */}
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {isEditing ? (
          <TextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
            style={styles.nameInput}
            autoFocus
          />
        ) : (
          <Text style={styles.userName}>{user.name}</Text>
        )}
        <Text style={styles.userEmail}>{user.email}</Text>

        {/* Role badge */}
        {user.role && (
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
            <Text style={styles.roleText}>{user.role.name}</Text>
          </View>
        )}
      </View>

      {/* ── Restaurant Info ──────────────────────────────── */}
      {user.restaurant && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <View style={styles.infoRow}>
            <Ionicons name="restaurant" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{user.restaurant.name}</Text>
          </View>
          {user.restaurant.slug && (
            <View style={styles.infoRow}>
              <Ionicons name="link" size={18} color={Colors.light.secondary} />
              <Text style={styles.infoSubText}>/{user.restaurant.slug}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Permissions ──────────────────────────────────── */}
      {user.role?.permissions && user.role.permissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Permissions ({user.role.permissions.length})
          </Text>
          {user.role.permissions.map((perm, i) => (
            <View key={perm.id || i} style={styles.permRow}>
              <View style={styles.permDot} />
              <Text style={styles.permText}>{perm.action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Action Buttons ───────────────────────────────── */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsEditing(false);
                setName(user.name);
                setError(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Logout ───────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.logoutBtn, loggingOut && { opacity: 0.7 }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  headerSection: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.8)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 4,
    minWidth: 180,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  roleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    backgroundColor: Colors.light.card,
    margin: 16,
    marginBottom: 0,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600",
  },
  infoSubText: {
    fontSize: 14,
    color: Colors.light.secondary,
  },

  // Permissions
  permRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 10,
  },
  permDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  permText: {
    fontSize: 13,
    color: Colors.light.text,
  },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    flex: 1,
    fontWeight: "500",
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 12,
    margin: 16,
    marginTop: 20,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: Colors.primary + "08",
  },
  editBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: Colors.light.card,
  },
  cancelText: {
    color: Colors.light.text,
    fontWeight: "600",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.error,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.error,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
