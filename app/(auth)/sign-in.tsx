import { Colors } from "@/constants/theme";
import { loginApi } from "@/src/api/authApi";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions, Image, KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { height } = Dimensions.get("window");

export default function SignIn() {
  const { saveSession, token, user } = useAuth();
  const { colors, isDark } = useTheme();

  // ── If already logged in, skip to dashboard ──
  useEffect(() => {
    if (token && user) {
      router.replace("/");
    }
  }, [token, user]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({ email: email.trim(), password });
      const result = response.data;

      if (!result.success) {
        setError(result.message || "Login failed");
        return;
      }

      const token = result.token || result.data?.token;
      const user = result.user || (result.data?.user ? result.data.user : result.data);

      if (!token || !user) {
        console.error("Invalid login response format:", result);
        setError("Login failed. Please try again.");
        return;
      }

      console.log("Login success, saving session for:", user.email);
      await saveSession(token, user);
    } catch (err: any) {
      console.error("Login Error:", err?.response?.data || err.message);
      const status = err.response?.status;
      if (status === 402) {
        setError("Your subscription has expired. Please renew your plan.");
      } else {
        setError(err.response?.data?.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topShape, { backgroundColor: Colors.primary }]} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* ── Logo area ── */}
            <View style={styles.brandArea}>
              <View style={[styles.logoCircle, { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.3)" }]}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandTitle}>PlatterOS</Text>
              <Text style={styles.brandTagline}>Restaurant Management System</Text>
            </View>

            {/* ── Login Card ── */}
            <View style={[styles.card, { backgroundColor: colors.card, shadowColor: Colors.primary }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Login</Text>
              <Text style={[styles.cardSubtitle, { color: colors.secondary }]}>Sign in to manage your restaurant</Text>

              <View style={styles.inputLabelRow}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>Email Address</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: isDark ? colors.background : "#fcfdfe" }]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? "#4b5563" : "#94a3b8"}
                  style={[styles.input, { color: colors.text }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(null); }}
                />
              </View>

              <View style={styles.inputLabelRow}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>Password</Text>
              </View>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: isDark ? colors.background : "#fcfdfe" }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colors.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor={isDark ? "#4b5563" : "#94a3b8"}
                  style={[styles.input, { flex: 1, color: colors.text }]}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(null); }}
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              {error && (
                <View style={[styles.errorBox, { backgroundColor: isDark ? "#450a0a" : "#fef2f2", borderColor: isDark ? "#7f1d1d" : "#fee2e2" }]}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={[styles.errorText, { color: "#ef4444" }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors.primary }, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
              </TouchableOpacity>

              <View style={styles.registerWrap}>
                <Text style={[styles.registerText, { color: colors.secondary }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={[styles.registerLink, { color: Colors.primary }]}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.footer, { color: colors.secondary }]}>Powered by PlatterOS</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  topShape: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 60 : 80,
    paddingBottom: 40,
  },
  brandArea: { alignItems: "center", marginBottom: 40 },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  logoImage: { width: 60, height: 60 },
  brandTitle: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "600" },

  card: {
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 36,
    shadowOpacity: 0.15,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
  cardTitle: { fontSize: 26, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  cardSubtitle: { fontSize: 14, textAlign: "center", marginBottom: 32, fontWeight: "500" },

  inputLabelRow: { marginBottom: 8, paddingLeft: 4 },
  inputLabel: { fontSize: 13, fontWeight: "700" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 4,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, paddingVertical: 10, fontWeight: "600" },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1, fontWeight: "600" },

  button: {
    borderRadius: 16,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  registerWrap: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  registerText: { fontSize: 14, fontWeight: "500" },
  registerLink: { fontSize: 14, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 12, marginTop: 32, fontWeight: "600" },
});

