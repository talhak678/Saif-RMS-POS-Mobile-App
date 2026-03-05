import { Colors } from "@/constants/theme";
import { getMeApi } from "@/src/api/authApi";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

// ─── Inner content: reads auth + app theme ─────────────────────────────────

function AppContent() {
  const { loading, saveSession } = useAuth();
  const { isDark, colors } = useTheme();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    checkAuth();
  }, [loading]);

  const checkAuth = async () => {
    const storedToken = await AsyncStorage.getItem("auth_token");
    if (!storedToken) {
      router.replace("/(auth)/sign-in");
      setAuthChecked(true);
      return;
    }
    try {
      const res = await getMeApi();
      if (res.data?.success && res.data?.data) {
        await saveSession(storedToken, res.data.data);
        router.replace("/");
      } else {
        router.replace("/(auth)/sign-in");
      }
    } catch {
      router.replace("/(auth)/sign-in");
    } finally {
      setAuthChecked(true);
    }
  };

  // Build navigation theme from current app theme
  const navTheme = isDark
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: Colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: Colors.primary,
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: Colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: Colors.primary,
      },
    };

  return (
    <NavThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="edit-profile" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Splash overlay while auth check runs */}
      {(loading || !authChecked) && (
        <View style={[splashStyles.overlay, { backgroundColor: colors.background }]}>
          <Image
            source={require("../assets/images/icon.png")}
            style={splashStyles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
          <Text style={[splashStyles.text, { color: colors.secondary }]}>Loading…</Text>
        </View>
      )}
    </NavThemeProvider>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const splashStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: { width: 120, height: 120 },
  text: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    letterSpacing: 0.4,
  },
});
