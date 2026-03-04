import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMeApi } from "@/src/api/authApi";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

// ─── Inner App — has access to AuthContext ────────────────────────────────────
function AppContent({ theme }: { theme: typeof DefaultTheme | typeof DarkTheme }) {
  const { loading, saveSession } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait until AuthContext has finished reading AsyncStorage
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

  return (
    <ThemeProvider value={theme}>
      {/* Stack is ALWAYS mounted so router.replace() works */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="edit-profile" />
      </Stack>
      <StatusBar style="auto" />

      {/* Overlay loader sits on top until auth check is done */}
      {(loading || !authChecked) && (
        <View style={splashStyles.overlay}>
          <Image
            source={require("../assets/images/icon.png")}
            style={splashStyles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 24 }}
          />
          <Text style={splashStyles.text}>Loading…</Text>
        </View>
      )}
    </ThemeProvider>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const colorScheme = useColorScheme();

  const theme =
    colorScheme === "dark"
      ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: Colors.primary,
          background: Colors.dark.background,
          card: Colors.dark.card,
          text: Colors.dark.text,
          border: Colors.dark.border,
          notification: Colors.primary,
        },
      }
      : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: Colors.primary,
          background: Colors.light.background,
          card: Colors.light.card,
          text: Colors.light.text,
          border: Colors.light.border,
          notification: Colors.primary,
        },
      };

  return (
    <AuthProvider>
      <AppContent theme={theme} />
    </AuthProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const splashStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // covers the entire screen
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logo: {
    width: 120,
    height: 120,
  },
  text: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 12,
    letterSpacing: 0.4,
  },
});
