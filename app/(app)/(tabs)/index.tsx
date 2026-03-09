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
import { useDashboard } from "@/src/context/DashboardContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  const safe = Number(n ?? 0);
  if (safe >= 1_000_000) return `USD ${(safe / 1_000_000).toFixed(2)}M`;
  if (safe >= 1_000) return `USD ${(safe / 1_000).toFixed(2)}K`;
  return `USD ${safe.toFixed(2)}`;
}

function fmtNum(n: number | null | undefined): string {
  const safe = Number(n ?? 0);
  const rounded = Math.round(safe * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toLocaleString() : rounded.toFixed(2);
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
  const { colors, isDark } = useTheme();
  const {
    data,
    loading,
    refreshing,
    error,
    period,
    setPeriod,
    fetchDashboard
  } = useDashboard();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only fetch if we don't have data yet
    if (!data) {
      fetchDashboard();
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard, data]);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get("/notifications");
      const list = res.data?.data || res.data || [];
      const unread = list.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("Failed to fetch unread count");
    }
  };

  const handleManualReload = () => {
    fetchDashboard(true); // force full loading state
    fetchUnreadCount();
  };

  const onRefresh = () => {
    fetchDashboard(false); // background refresh (refresh control)
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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Fixed Header ──────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/icon.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>PlatterOS</Text>
            <Text style={[styles.headerDate, { color: colors.secondary }]}>{todayLabel()}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/(app)/notifications" as any)}
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleManualReload}
            style={[styles.iconBtn, { backgroundColor: colors.background }]}
          >
            <Ionicons name="reload-outline" size={20} color={colors.text} />
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
          style={[styles.scroll, { backgroundColor: colors.background }]}
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
    paddingTop: 42,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
    marginBottom: 10,
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
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
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
