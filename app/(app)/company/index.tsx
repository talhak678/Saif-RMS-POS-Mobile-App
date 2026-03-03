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

interface Company {
  Id: string;
  Name: string;
  Address: string;
  Email: string;
  ContactNumber: string;
  Status: number;
}

export default function CompaniesScreen() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchCompanies = async (pageNo = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/companies?page=${pageNo}&limit=10&search=${search}`
      );

      const list = res?.data?.data || [];

      const transformed = list.map((c: any) => ({
        Id: c.id?.toString(),
        Name: c.name,
        Address: c.address,
        Email: c.email,
        ContactNumber: c.contactNumber,
        Status: c.status,
      }));

      setCompanies(pageNo === 1 ? transformed : [...companies, ...transformed]);
    } catch (e) {
      console.log("API error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, [search]);

  const renderItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/company/${item.Id}` as any)}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{item.Name}</Text>
        <View
          style={[
            styles.statusBadge,
            item.Status === 1 ? styles.active : styles.inactive,
          ]}
        >
          <Text style={styles.statusText}>
            {item.Status === 1 ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <Text style={styles.text}>{item.Address}</Text>
      <Text style={styles.text}>{item.Email}</Text>
      <Text style={styles.text}>{item.ContactNumber}</Text>

      <Pressable
        style={styles.editBtn}
        onPress={() => router.push(`/company/${item.Id}/edit` as any)}
      >
        <Ionicons name="create-outline" size={16} color={Colors.primary} />
        <Text style={styles.editText}>Edit</Text>
      </Pressable>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔝 HEADER */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </Pressable>

        <Text style={styles.title}>Companies</Text>

        <Pressable
          onPress={() => router.push("/(app)/company/addcompany")}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* 🔍 SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.secondary} />
        <TextInput
          placeholder="Search company..."
          placeholderTextColor={Colors.secondary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => item.Id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 90 }}
          onEndReached={() => {
            const next = page + 1;
            setPage(next);
            fetchCompanies(next);
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <Text style={styles.empty}>No companies found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },

  /* HEADER */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  backBtn: {
    padding: 6,
    backgroundColor: Colors.primary + "15",
    borderRadius: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },

  addBtn: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 10,
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.light.text,
  },

  /* CARD */
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  active: {
    backgroundColor: "#DCFCE7",
  },

  inactive: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  text: {
    fontSize: 13,
    color: Colors.light.secondary,
    marginTop: 4,
  },

  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-end",
  },

  editText: {
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },

  empty: {
    textAlign: "center",
    color: Colors.light.secondary,
    marginTop: 40,
  },
});

