import apiClient from "@/src/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DemographicCard from "@/src/components/dashboard/DemographicCard";
import MetricsCards from "@/src/components/dashboard/MetricsCards";
import MonthlySalesChart from "@/src/components/dashboard/MonthlySalesChart";
import StatisticsChart from "@/src/components/dashboard/StatisticsChart";
import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/sign-in");
  };

  async function fetchStats() {
    try {
      const res = await apiClient.get("/dashboard?period=monthly");
      setStats(res.data.data);
    } catch (e) {
      console.log("Dashboard error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>3PL DYNAMICS</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <MetricsCards stats={stats} />
          </View>

          <View style={styles.card}>
            <MonthlySalesChart stats={stats} />
          </View>

          <View style={styles.card}>
            <StatisticsChart stats={stats} />
          </View>

          <View style={styles.card}>
            <DemographicCard stats={stats} />
          </View>
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0F9FF", // light sky
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* HEADER */
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  welcome: {
    fontSize: 13,
    color: "#64748B",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0284C7",
  },

  logoutBtn: {
    backgroundColor: "#E0F2FE",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  logoutText: {
    color: "#0284C7",
    fontWeight: "600",
    fontSize: 14,
  },

  /* CONTENT */
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
});
