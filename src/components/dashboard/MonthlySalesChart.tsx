import { Colors } from "@/constants/theme";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

export default function MonthlySalesChart({ stats }: any) {
  const screenWidth = Dimensions.get("window").width - 56;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Monthly Sales</Text>

      <BarChart
        data={{
          labels: stats?.monthlyChart?.months || [],
          datasets: [{ data: stats?.monthlyChart?.orders || [] }],
        }}
        width={screenWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        chartConfig={{
          backgroundColor: Colors.light.card,
          backgroundGradientFrom: Colors.light.card,
          backgroundGradientTo: Colors.light.card,
          decimalPlaces: 0,
          color: () => Colors.primary,
          labelColor: () => Colors.light.secondary,
        }}
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

