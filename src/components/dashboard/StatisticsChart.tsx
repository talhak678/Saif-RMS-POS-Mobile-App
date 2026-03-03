import { Colors } from "@/constants/theme";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function StatisticsChart({ stats }: any) {
  const width = Dimensions.get("window").width - 56;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Statistics</Text>

      <LineChart
        data={{
          labels: stats?.monthlyChart?.months || [],
          datasets: [
            { data: stats?.monthlyChart?.customers || [], color: () => Colors.primary },
            { data: stats?.monthlyChart?.orders || [], color: () => "#22C55E" },
          ],
          legend: ["Customers", "Orders"],
        }}
        width={width}
        height={240}
        chartConfig={{
          backgroundGradientFrom: Colors.light.card,
          backgroundGradientTo: Colors.light.card,
          color: () => Colors.primary,
          labelColor: () => Colors.light.secondary,
        }}
        bezier
        style={{ borderRadius: 12 }}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: Colors.light.text,
  },
});

