import apiClient from "@/src/api/apiClient";
import { useTheme } from "@/src/context/ThemeContext";
import { C } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface INotification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsScreen() {
    const { isDark } = useTheme();
    const scheme = isDark ? "dark" : "light";

    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/notifications");
            // Use fallback if response structure differs
            const data = res.data?.data || res.data || [];
            setNotifications(data);
        } catch (err) {
            console.error("Fetch notifications error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/notifications/${id}`, { isRead: true });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            console.error("Mark as read failed:", err);
        }
    };

    const markAllRead = async () => {
        try {
            // Assuming endpoint exists or we loop
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            await Promise.all(unreadIds.map(id => apiClient.patch(`/notifications/${id}`, { isRead: true })));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Mark all read failed:", err);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await apiClient.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Delete notification failed:", err);
        }
    };

    const filteredData = activeTab === "ALL"
        ? notifications
        : notifications.filter(n => !n.isRead);

    const renderItem = ({ item }: { item: INotification }) => (
        <TouchableOpacity
            style={[
                s.card,
                { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] },
                !item.isRead && { borderLeftColor: C.primary[scheme], borderLeftWidth: 4 }
            ]}
            onPress={() => !item.isRead && markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={s.cardIcon}>
                <Ionicons
                    name={item.isRead ? "notifications-outline" : "notifications"}
                    size={20}
                    color={item.isRead ? C.secondary[scheme] : C.primary[scheme]}
                />
            </View>
            <View style={s.cardBody}>
                <Text style={[s.message, { color: C.text[scheme] }, !item.isRead && s.unreadText]}>
                    {item.message}
                </Text>
                <Text style={[s.time, { color: C.secondary[scheme] }]}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <TouchableOpacity style={s.trashBtn} onPress={() => deleteNotification(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[s.container, { backgroundColor: C.screenBg[scheme] }]}>
            {/* Header */}
            <View style={[s.header, { borderBottomColor: C.border[scheme] }]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: C.text[scheme] }]}>Notifications</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text style={[s.markAll, { color: C.primary[scheme] }]}>Clear All</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={s.tabs}>
                <TouchableOpacity
                    style={[s.tab, activeTab === "ALL" && { borderBottomColor: C.primary[scheme] }]}
                    onPress={() => setActiveTab("ALL")}
                >
                    <Text style={[s.tabLabel, { color: activeTab === "ALL" ? C.primary[scheme] : C.secondary[scheme] }]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.tab, activeTab === "UNREAD" && { borderBottomColor: C.primary[scheme] }]}
                    onPress={() => setActiveTab("UNREAD")}
                >
                    <Text style={[s.tabLabel, { color: activeTab === "UNREAD" ? C.primary[scheme] : C.secondary[scheme] }]}>Unread</Text>
                </TouchableOpacity>
            </View>

            {loading && notifications.length === 0 ? (
                <View style={s.center}>
                    <ActivityIndicator color={C.primary[scheme]} size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={s.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchNotifications}
                            tintColor={C.primary[scheme]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Ionicons name="mail-open-outline" size={60} color={C.secondary[scheme]} />
                            <Text style={[s.emptyText, { color: C.secondary[scheme] }]}>No notifications found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: Platform.OS === "ios" ? 60 : 50,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40 },
    headerTitle: { fontSize: 18, fontWeight: "800" },
    markAll: { fontSize: 13, fontWeight: "700" },

    tabs: { flexDirection: "row", paddingHorizontal: 20, marginTop: 10 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabLabel: { fontSize: 14, fontWeight: "700" },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    list: { padding: 16, gap: 12 },
    card: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
    },
    cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(79, 70, 229, 0.08)', alignItems: "center", justifyContent: "center", marginRight: 12 },
    cardBody: { flex: 1 },
    message: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
    unreadText: { fontWeight: "800" },
    time: { fontSize: 12, marginTop: 4, fontWeight: "600", opacity: 0.8 },
    trashBtn: { padding: 4, marginLeft: 8 },

    empty: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 15, fontWeight: "600" },
});
