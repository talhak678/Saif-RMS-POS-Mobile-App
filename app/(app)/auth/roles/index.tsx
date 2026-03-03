import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import apiClient from "../../../../src/api/apiClient";

interface Role {
    Id: number;
    Name: string;
    Description: string;
    Status: 0 | 1;
    Warehouse?: { name: string; code: string };
}

export default function RolesScreen() {
    const router = useRouter();

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const fetchRoles = async (pageNo = 1) => {
        try {
            if (pageNo === 1) setLoading(true);

            const res = await apiClient.get(
                `/roles?page=${pageNo}&limit=10&search=${search}`
            );

            const list = res?.data?.data || [];

            setRoles(pageNo === 1 ? list : [...roles, ...list]);
        } catch {
            Alert.alert("Error", "Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles(1);
    }, [search]);

    const toggleStatus = (role: Role) => {
        Alert.alert(
            role.Status === 1 ? "Disable Role" : "Enable Role",
            "Are you sure?",
            [
                { text: "Cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            setActing(true);
                            if (role.Status === 1) {
                                await apiClient.delete(`/roles/${role.Id}`);
                            } else {
                                await apiClient.post(`/roles/${role.Id}/restore`, {});
                            }
                            fetchRoles(1);
                        } catch {
                            Alert.alert("Action failed");
                        } finally {
                            setActing(false);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Role }) => (
        <View style={styles.card}>
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

            <Text style={styles.text}>{item.Description || "---"}</Text>
            <Text style={styles.text}>📦 {item.Warehouse ? `${item.Warehouse.name} (${item.Warehouse.code})` : "---"}</Text>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => router.push((`/auth/roles/${item.Id}`) as any)}>
                    <Text style={styles.link}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push((`/auth/roles/${item.Id}/edit`) as any)}>
                    <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleStatus(item)}>
                    <Text style={[styles.link, { color: Colors.error }]}>
                        {item.Status === 1 ? "Disable" : "Enable"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.primary} />
                </Pressable>

                <Text style={styles.title}>Roles</Text>

                <Pressable
                    onPress={() => router.push("/auth/roles/add")}
                    style={styles.addBtn}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </Pressable>
            </View>

            {/* SEARCH */}
            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Colors.secondary} />
                <TextInput
                    placeholder="Search roles..."
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
                    data={roles}
                    keyExtractor={(i) => i.Id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    onEndReached={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchRoles(next);
                    }}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No roles found</Text>
                    }
                />
            )}

            {acting && <ActivityIndicator style={{ marginTop: 10 }} color={Colors.primary} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background, padding: 16 },

    topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
    backBtn: { padding: 6, backgroundColor: Colors.primary + "15", borderRadius: 10 },
    addBtn: { backgroundColor: Colors.primary, padding: 8, borderRadius: 10 },

    searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: Colors.light.text },

    card: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    name: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8, color: Colors.light.text },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    active: { backgroundColor: "#DCFCE7" },
    inactive: { backgroundColor: "#FEE2E2" },
    statusText: { fontSize: 12, fontWeight: "600" },
    text: { fontSize: 13, color: Colors.light.secondary, marginTop: 4 },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    link: { color: Colors.primary, fontWeight: "600" },
    empty: { textAlign: "center", color: Colors.light.secondary, marginTop: 40 },
});

