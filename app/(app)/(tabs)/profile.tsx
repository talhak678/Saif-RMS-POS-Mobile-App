import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
        {user.restaurant?.logo ? (
          <View style={s.logoWrapper}>
            <Image source={{ uri: user.restaurant.logo }} style={s.logoImg} resizeMode="contain" />
          </View>
        ) : (
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
        )}

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



      {/* ── Error ── */}
      {error && (
        <View style={[s.errorBox, { backgroundColor: isDark ? '#3b1212' : '#FEF2F2' }]}>
          <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Restaurant Info Box ── */}
      {user.restaurant && (() => {
        const restaurant = user.restaurant;
        return (
          <View style={[s.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.secondary }]}>RESTAURANT DETAILS</Text>

            <View style={s.restMainInfo}>
              <View>
                <Text style={[s.restName, { color: colors.text }]}>{restaurant.name}</Text>
                <TouchableOpacity onPress={() => {
                  const url = restaurant.customDomain
                    ? `https://${restaurant.customDomain}`
                    : `https://${restaurant.slug}.platteros.com`;
                  require('react-native').Linking.openURL(url);
                }}>
                  <Text style={[s.restSlug, { color: Colors.primary }]}>
                    {restaurant.customDomain || `${restaurant.slug}.platteros.com`}
                    {" "}<Ionicons name="open-outline" size={12} color={Colors.primary} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {restaurant.description && (
              <Text style={[s.restDesc, { color: colors.secondary }]}>
                {restaurant.description}
              </Text>
            )}

            <View style={s.socialRow}>
              {restaurant.facebookUrl && (
                <TouchableOpacity style={[s.socialCircle, { backgroundColor: '#1877F2' }]}>
                  <Ionicons name="logo-facebook" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              {restaurant.instagramUrl && (
                <TouchableOpacity style={[s.socialCircle, { backgroundColor: '#E4405F' }]}>
                  <Ionicons name="logo-instagram" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              {restaurant.tiktokUrl && (
                <TouchableOpacity style={[s.socialCircle, { backgroundColor: '#000' }]}>
                  <Ionicons name="logo-tiktok" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })()}

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

  headerSection: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImg: { width: '100%', height: '100%' },
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
  userName: { fontSize: 24, fontWeight: "900", color: "#fff", marginBottom: 4 },
  nameInput: {
    fontSize: 22,
    fontWeight: "900",
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

  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
    opacity: 0.6,
  },

  restMainInfo: { marginBottom: 10 },
  restName: { fontSize: 20, fontWeight: "900", marginBottom: 2 },
  restSlug: { fontSize: 14, fontWeight: "700" },
  restDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 16, fontWeight: "700" },
  settingSubLabel: { fontSize: 13, marginTop: 2 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    gap: 8,
  },
  errorText: { fontSize: 14, color: "#DC2626", fontWeight: "600" },

  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    height: 54,
  },
  editBtnText: { color: Colors.primary, fontWeight: "800", fontSize: 16 },
  cancelBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 16 },
  cancelText: { fontWeight: "700", fontSize: 16 },
  saveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 50,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, height: 50, lineHeight: 18, textAlignVertical: "center" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.error,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    height: 56,
    shadowColor: Colors.error,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

