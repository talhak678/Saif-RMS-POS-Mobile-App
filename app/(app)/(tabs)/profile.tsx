import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!user) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
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

  const initials = user.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* ── Avatar / Header ── */}
      <View style={s.headerSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        {isEditing ? (
          <TextInput
            value={name}
            onChangeText={v => { setName(v); setError(null); }}
            style={s.nameInput}
            autoFocus
          />
        ) : (
          <Text style={s.userName}>{user.name}</Text>
        )}
        <Text style={s.userEmail}>{user.email}</Text>
        {user.role && (
          <View style={s.roleBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#fff" />
            <Text style={s.roleText}>{user.role.name}</Text>
          </View>
        )}
      </View>

      {/* ── Appearance ── */}
      <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.secondary }]}>Appearance</Text>
        <View style={s.settingRow}>
          <View style={s.settingLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: isDark ? '#2d3f5c' : Colors.primary + '12' }]}>
              <Ionicons
                name={isDark ? "moon" : "sunny-outline"}
                size={18}
                color={Colors.primary}
              />
            </View>
            <View>
              <Text style={[s.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[s.settingSubLabel, { color: colors.secondary }]}>
                {isDark ? "Dark theme active" : "Light theme active"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#E2E8F0", true: Colors.primary + "60" }}
            thumbColor={isDark ? Colors.primary : "#fff"}
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      </View>

      {/* ── Restaurant Info ── */}
      {user.restaurant && (
        <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.secondary }]}>Restaurant</Text>
          <View style={s.infoRow}>
            <View style={[s.infoIconWrap, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="restaurant" size={16} color={Colors.primary} />
            </View>
            <Text style={[s.infoText, { color: colors.text }]}>{user.restaurant.name}</Text>
          </View>
          {user.restaurant.slug && (
            <View style={s.infoRow}>
              <View style={[s.infoIconWrap, { backgroundColor: colors.border }]}>
                <Ionicons name="link" size={16} color={colors.secondary} />
              </View>
              <Text style={[s.infoSubText, { color: colors.secondary }]}>/{user.restaurant.slug}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Permissions ── */}
      {user.role?.permissions && user.role.permissions.length > 0 && (
        <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.secondary }]}>
            Permissions ({user.role.permissions.length})
          </Text>
          {user.role.permissions.map((perm, i) => (
            <View key={perm.id || i} style={s.permRow}>
              <View style={[s.permDot, { backgroundColor: Colors.primary }]} />
              <Text style={[s.permText, { color: colors.text }]}>{perm.action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Error ── */}
      {error && (
        <View style={[s.errorBox, { backgroundColor: isDark ? '#3b1212' : '#FEF2F2' }]}>
          <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Actions ── */}
      <View style={s.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[s.cancelBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => { setIsEditing(false); setName(user.name); setError(null); }}
            >
              <Text style={[s.cancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[s.editBtn, { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Logout ── */}
      <TouchableOpacity
        style={[s.logoutBtn, loggingOut && { opacity: 0.7 }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={s.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header — always brand colored
  headerSection: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 48 : 60,
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
  avatarText: { fontSize: 30, fontWeight: "800", color: "#fff" },
  userName: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 4 },
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
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 12 },
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
  roleText: { fontSize: 12, color: "#fff", fontWeight: "700", letterSpacing: 0.5 },

  // Sections
  section: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  // Dark mode toggle row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 15, fontWeight: "700" },
  settingSubLabel: { fontSize: 12, marginTop: 2 },

  // Info rows
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { fontSize: 15, fontWeight: "600" },
  infoSubText: { fontSize: 14 },

  // Permissions
  permRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, gap: 10 },
  permDot: { width: 7, height: 7, borderRadius: 4 },
  permText: { fontSize: 13 },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1, fontWeight: "500" },

  // Buttons
  actions: { flexDirection: "row", gap: 12, margin: 16, marginTop: 20 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  editBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
  },
  cancelText: { fontWeight: "600", fontSize: 15 },
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
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
