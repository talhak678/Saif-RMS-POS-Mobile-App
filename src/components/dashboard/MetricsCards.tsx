import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function MetricsCards({ stats }: any) {
  const cards = [
    {
      label: "Customers",
      value: stats?.customers?.count || 0,
      growth: stats?.customers?.growth || 0,
      icon: "people-outline",
    },
    {
      label: "Orders",
      value: stats?.orders?.count || 0,
      growth: stats?.orders?.growth || 0,
      icon: "cube-outline",
    },
  ];

  return (
    <View style={styles.row}>
      {cards.map((c, i) => (
        <View key={i} style={styles.card}>
          <Ionicons name={c.icon as any} size={22} color="#2563EB" />
          <Text style={styles.label}>{c.label}</Text>
          <Text style={styles.value}>{c.value}</Text>
          <Text style={{ color: c.growth >= 0 ? "#16A34A" : "#DC2626" }}>
            {c.growth >= 0 ? "+" : ""}
            {c.growth}%
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  label: {
    marginTop: 8,
    color: "#64748B",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    marginVertical: 4,
  },
});
