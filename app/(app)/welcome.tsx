import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import ProtectedRoute from "../../src/components/ProtectedRoute";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Welcome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        console.log('userrr',userData);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.log("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/sign-in");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 10, color: "#2563EB" }}>
        Welcome {user?.name || "User"} 
        </Text>

        <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 30 }}>
          You are logged in successfully
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#EF4444",
            padding: 14,
            borderRadius: 10,
            minWidth: 120,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}
