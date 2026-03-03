import { Colors } from "@/constants/theme";
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
          <Ionicons name={c.icon as any} size={22} color={Colors.primary} />
          <Text style={styles.label}>{c.label}</Text>
          <Text style={styles.value}>{c.value}</Text>
          <Text style={{ color: c.growth >= 0 ? Colors.success : Colors.error, fontWeight: "600" }}>
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
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  label: {
    marginTop: 8,
    color: Colors.light.secondary,
    fontSize: 14,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    marginVertical: 4,
    color: Colors.light.text,
  },
});

