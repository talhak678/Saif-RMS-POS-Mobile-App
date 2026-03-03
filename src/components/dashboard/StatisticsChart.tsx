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
            { data: stats?.monthlyChart?.customers || [], color: () => "#2563EB" },
            { data: stats?.monthlyChart?.orders || [], color: () => "#22C55E" },
          ],
          legend: ["Customers", "Orders"],
        }}
        width={width}
        height={240}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => "#2563EB",
          labelColor: () => "#64748B",
        }}
        bezier
        style={{ borderRadius: 12 }}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    // padding: 10,
    // marginTop: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
});
