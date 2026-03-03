import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import MapView, { Marker } from "react-native-maps";
import apiClient from "../../../../src/api/apiClient";

interface Warehouse {
  name: string;
  code: string;
  managerName: string;
  managerContactNumber: string;
  country: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  status: number;
}

export default function WarehouseDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWarehouse = async () => {
    try {
      const res = await apiClient.get(`/warehouses/${id}`);

      const warehouse =
        res?.data?.data || res?.data?.title?.data?.data;

      setData({
        name: warehouse?.name || "",
        code: warehouse?.code || "",
        managerName: warehouse?.managerName || "",
        managerContactNumber:
          warehouse?.managerContactNumber || "",
        country: warehouse?.country || "",
        state: warehouse?.state || "",
        city: warehouse?.city || "",
        address: warehouse?.address || "",
        latitude: warehouse?.latitude || "0",
        longitude: warehouse?.longitude || "0",
        status: warehouse?.status || 1,
      });
    } catch (e) {
      console.log("Error loading warehouse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouse();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Warehouse Details</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Info */}
      <View style={styles.card}>
        <Info label="Warehouse Name" value={data.name} />
        <Info label="Code" value={data.code} />
        <Info label="Manager Name" value={data.managerName} />
        <Info
          label="Manager Contact"
          value={data.managerContactNumber}
        />
        <Info
          label="Status"
          value={data.status === 1 ? "Active" : "Inactive"}
        />
      </View>

      {/* Address */}
      <View style={styles.card}>
        <Info label="Country" value={data.country} />
        <Info label="State" value={data.state} />
        <Info label="City" value={data.city} />
        <Info label="Address" value={data.address} />
      </View>

      {/* Map (Optional) */}
      {/*
      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>Warehouse Location</Text>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={{
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
            }}
          />
        </MapView>
      </View>
      */}
    </ScrollView>
  );
}

/* 🔹 Inline Info Row */
const Info = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  cancel: {
    color: "#2563EB",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },

  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },

  map: {
    height: 220,
    borderRadius: 12,
  },
});
