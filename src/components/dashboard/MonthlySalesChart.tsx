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
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: () => "#2563EB",
          labelColor: () => "#64748B",
        }}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    // padding: 16,
    // marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
});
