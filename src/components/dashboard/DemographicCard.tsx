import { StyleSheet, Text, View } from "react-native";

export default function DemographicCard({ stats }: any) {
  const data = stats?.regionWiseCustomers || [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Customers Demographic</Text>

      {data.map((r: any, i: number) => (
        <View key={i} style={styles.row}>
          <Text style={styles.country}>{r.country}</Text>
          <Text style={styles.count}>{r.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    // marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  country: {
    fontWeight: "600",
  },
  count: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
