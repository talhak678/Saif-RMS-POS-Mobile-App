import { Colors } from "@/constants/theme";
import apiClient from "@/src/api/apiClient";
import CategoryRevenue from "@/src/components/dashboard/CategoryRevenue";
import KPICard from "@/src/components/dashboard/KPICard";
import PeriodSelector from "@/src/components/dashboard/PeriodSelector";
import ReviewCard from "@/src/components/dashboard/ReviewCard";
import SourceBreakdown from "@/src/components/dashboard/SourceBreakdown";
import StatusBreakdown from "@/src/components/dashboard/StatusBreakdown";
import TopItemsList from "@/src/components/dashboard/TopItemsList";
import TrendChart from "@/src/components/dashboard/TrendChart";
import TypeBreakdown from "@/src/components/dashboard/TypeBreakdown";
import { useAuth } from "@/src/context/AuthContext";
import { DashboardPeriod, IDashboardData } from "@/types/dashboard.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <View style={{ padding: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={sk.block} />
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  block: {
    height: 80,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 14,
    opacity: 0.7,
  },
});

// ─── Super Admin Guard ────────────────────────────────────────────────────────

function SuperAdminPlaceholder() {
  return (
    <View style={styles.saCenter}>
      <Ionicons name="shield" size={48} color={Colors.primary} />
      <Text style={styles.saTitle}>Super Admin</Text>
      <Text style={styles.saSubtitle}>
        The merchant dashboard is not available for Super Admin.
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<IDashboardData | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/dashboard?period=${period}`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Failed to load dashboard");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Network error. Try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard(false);
  };

  // ── Super Admin Check
  if (user?.role?.name === "SUPER_ADMIN") {
    return <SuperAdminPlaceholder />;
  }

  // ── Avatar initials
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <View style={styles.root}>
      {/* ── Fixed Header ──────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/icon.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>PlatterOS</Text>
            <Text style={styles.headerDate}>{todayLabel()}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push("/(app)/(tabs)/profile")}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Period Selector (outside scroll so it stays sticky) */}
      <PeriodSelector selected={period} onSelect={setPeriod} />

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={44} color="#9CA3AF" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchDashboard()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* ── KPI Cards ─── 2-column grid */}
          <Text style={styles.sectionLabel}>Key Metrics</Text>
          <View style={styles.kpiGrid}>
            <KPICard
              label="Total Sales"
              value={fmt(data.totalSales)}
              icon="cash-outline"
              iconBg="#DCFCE7"
              iconColor="#16a34a"
              growth={data.growth.totalSales}
            />
            <KPICard
              label="Paid Revenue"
              value={fmt(data.totalRevenue)}
              icon="wallet-outline"
              iconBg={Colors.primary + "20"}
              iconColor={Colors.primary}
              growth={data.growth.revenue}
            />
          </View>
          <View style={styles.kpiGrid}>
            <KPICard
              label="Total Orders"
              value={fmtNum(data.totalOrders)}
              icon="bag-outline"
              iconBg="#FFF7ED"
              iconColor="#f97316"
              growth={data.growth.orders}
            />
            <KPICard
              label="Website Orders"
              value={fmtNum(data.websiteOrders)}
              icon="globe-outline"
              iconBg="#EFF6FF"
              iconColor="#3b82f6"
              growth={data.growth.websiteOrders}
            />
          </View>
          <View style={styles.kpiGrid}>
            <KPICard
              label="New Customers"
              value={fmtNum(data.newCustomers)}
              icon="people-outline"
              iconBg="#F5F3FF"
              iconColor="#8b5cf6"
              growth={data.growth.newCustomers}
            />
            <KPICard
              label="Avg Order Value"
              value={fmt(data.avgOrderValue)}
              icon="trending-up-outline"
              iconBg="#F0FDFA"
              iconColor="#0d9488"
              growth={undefined}
            />
          </View>

          {/* ── Monthly Trend Chart */}
          <TrendChart monthlySales={data.monthlySales} />

          {/* ── Order Status */}
          <StatusBreakdown
            statusBreakdown={data.statusBreakdown}
            totalOrders={data.totalOrders}
          />

          {/* ── Top Items */}
          <TopItemsList topItems={data.topItems} />

          {/* ── Platform Breakdown */}
          <SourceBreakdown sourceBreakdown={data.sourceBreakdown} />

          {/* ── Order Types */}
          <TypeBreakdown typeBreakdown={data.typeBreakdown} />

          {/* ── Category Revenue */}
          <CategoryRevenue categoryRevenue={data.categoryRevenue} />

          {/* ── Recent Reviews */}
          {data.recentReviews && data.recentReviews.length > 0 && (
            <View>
              <Text style={[styles.sectionLabel, { marginTop: 4 }]}>
                ⭐ Recent Reviews
              </Text>
              {data.recentReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </View>
          )}

          {/* Bottom padding for floating tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 48,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.light.text,
  },
  headerDate: {
    fontSize: 12,
    color: Colors.light.secondary,
    marginTop: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  // KPI Grid
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Error
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: Colors.light.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Super Admin
  saCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  saTitle: { fontSize: 22, fontWeight: "800", color: Colors.primary },
  saSubtitle: {
    fontSize: 14,
    color: Colors.light.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
