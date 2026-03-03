import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../../src/api/apiClient";

interface Warehouse {
  Id: string;
  Code: string;
  Name: string;
  ManagerName: string;
  ManagerContact: string;
  Status: number;
}

export default function WarehousesScreen() {
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchWarehouses = async (pageNo = 1) => {
    try {
      setLoading(true);

      const res = await apiClient.get(
        `/warehouses?page=${pageNo}&limit=10&search=${search}`
      );

      const list =
        res?.data?.data ||
        res?.data?.title?.data?.data ||
        [];

      const transformed = list.map((w: any) => ({
        Id: w.id?.toString(),
        Code: w.code,
        Name: w.name,
        ManagerName: w.managerName || "No manager",
        ManagerContact: w.managerContactNumber || "No contact",
        Status: w.status,
      }));

      setWarehouses(pageNo === 1 ? transformed : [...warehouses, ...transformed]);
    } catch (e) {
      console.log("API error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(1);
  }, [search]);

  const renderItem = ({ item }: { item: Warehouse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push((`/warehouse/${item.Id}`) as any)
      }
    >
      <View style={styles.rowBetween}>
        <Text style={styles.name}>
          {item.Name} ({item.Code})
        </Text>

        <Text
          style={[
            styles.badge,
            item.Status === 1 ? styles.active : styles.inactive,
          ]}
        >
          {item.Status === 1 ? "Active" : "Inactive"}
        </Text>
      </View>

      <Text style={styles.text}>Manager: {item.ManagerName}</Text>
      <Text style={styles.text}>Contact: {item.ManagerContact}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            router.push((`/warehouse/${item.Id}/edit`) as any)
          }
        >
          <Text style={styles.link}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Warehouses</Text>

      <TextInput
        placeholder="Search warehouse..."
        placeholderTextColor={Colors.secondary}
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Warehouses</Text>

        <Pressable
          onPress={() => router.push("/(app)/warehouse/addwarehouse")}
          style={styles.addButton}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={warehouses}
          keyExtractor={(item) => item.Id}
          renderItem={renderItem}
          onEndReached={() => {
            setPage((p) => {
              const next = p + 1;
              fetchWarehouses(next);
              return next;
            });
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: Colors.secondary }}>
              No warehouses found
            </Text>
          }
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },

  search: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
    fontSize: 15,
    color: Colors.light.text,
  },

  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
  },

  active: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },

  inactive: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },

  text: {
    fontSize: 13,
    color: Colors.light.secondary,
    marginTop: 2,
  },

  actions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  link: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});

