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

interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    status: 0 | 1;
    role: string;
    warehouse: string;
}

export default function UsersScreen() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [acting, setActing] = useState(false);

    const fetchUsers = async (pageNo = 1) => {
        try {
            if (pageNo === 1) setLoading(true);

            const res = await apiClient.get(
                `/users?page=${pageNo}&limit=10&search=${search}`
            );

            const list = res?.data?.data || [];

            const transformed = list.map((u: any) => ({
                id: u.Id.toString(),
                name: u.Name,
                email: u.Email,
                phoneNumber: u.PhoneNumber,
                status: u.Status,
                role: u.UserRole?.[0]?.Role?.Name || "---",
                warehouse: u.Warehouse?.name || "---",
            }));

            setUsers(pageNo === 1 ? transformed : [...users, ...transformed]);
        } catch {
            Alert.alert("Error", "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [search]);

    const toggleStatus = (user: User) => {
        Alert.alert(
            user.status === 1 ? "Disable User" : "Enable User",
            "Are you sure?",
            [
                { text: "Cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            setActing(true);
                            if (user.status === 1) {
                                await apiClient.delete(`/users/${user.id}`);
                            } else {
                                await apiClient.post(`/users/${user.id}/restore`, {});
                            }
                            fetchUsers(1);
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

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.name}</Text>

                <View
                    style={[
                        styles.statusBadge,
                        item.status === 1 ? styles.active : styles.inactive,
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.status === 1 ? "Active" : "Inactive"}
                    </Text>
                </View>
            </View>

            <Text style={styles.text}>{item.email}</Text>
            <Text style={styles.text}>📦 {item.warehouse}</Text>
            <Text style={styles.text}>👤 {item.role}</Text>
            <Text style={styles.text}>📞 {item.phoneNumber}</Text>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => router.push(`/auth/users/${item.id}` as any)}>
                    <Text style={styles.link}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push(`/auth/users/${item.id}/edit` as any)}
                >
                    <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => toggleStatus(item)}>
                    <Text style={[styles.link, { color: Colors.error }]}>
                        {item.status === 1 ? "Disable" : "Enable"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* 🔝 HEADER */}
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.primary} />
                </Pressable>

                <Text style={styles.title}>Users</Text>

                <Pressable
                    onPress={() => router.push("/auth/users/add" as any)}
                    style={styles.addBtn}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </Pressable>
            </View>

            {/* 🔍 SEARCH */}
            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Colors.secondary} />
                <TextInput
                    placeholder="Search users..."
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
                    data={users}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    onEndReached={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchUsers(next);
                    }}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No users found</Text>
                    }
                />
            )}

            {acting && <ActivityIndicator style={{ marginTop: 10 }} color={Colors.primary} />}
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
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
    backBtn: {
        padding: 6,
        backgroundColor: Colors.primary + "15",
        borderRadius: 10,
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

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
    },

    link: {
        color: Colors.primary,
        fontWeight: "600",
    },

    empty: {
        textAlign: "center",
        color: Colors.light.secondary,
        marginTop: 40,
    },
});

