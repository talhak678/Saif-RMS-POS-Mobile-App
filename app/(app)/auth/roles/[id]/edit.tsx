import apiClient from "@/src/api/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// -------------------- INTERFACES --------------------
interface Workspace {
    Id: number;
    Name: string;
}

interface Claim {
    claimType: string;
    claimValue: string;
}

interface RoleData {
    name: string;
    description: string;
    warehouseId: string;
    isMobile: boolean;
    isWeb: boolean;
    status: number;
    claims: Claim[];
    WorkspaceId?: number | null;
}

interface RoleResponse {
    Id: number;
    Name: string;
    Description: string;
    Status: number;
    IsWebRole: boolean;
    WarehouseId: number;
    WorkspaceId: number;
    RoleClaim: {
        Id: number;
        ClaimType: string;
        ClaimValue: string;
        RoleId: number;
    }[];
}

export default function EditRoleScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [warehouses, setWarehouses] = useState<{ id: number, name: string }[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [showWorkspaces, setShowWorkspaces] = useState(false);

    const [form, setForm] = useState<RoleData>({
        name: "",
        description: "",
        warehouseId: "",
        isMobile: true,
        isWeb: false,
        status: 1,
        claims: [],
        WorkspaceId: null,
    });

    const [error, setError] = useState<string | null>(null);

    // Toggle states
    const [selectAllMobile, setSelectAllMobile] = useState(false);
    const [selectAllWeb, setSelectAllWeb] = useState(false);
    const [selectAllSections, setSelectAllSections] = useState<Record<string, boolean>>({});

    // Permission options
    const mobilePageOptions = {
        inbound: ["RECEIVING", "PUTAWAY"],
        transactions: ["PICKING", "PUT TO WALL", "PACKER", "DISPATCHER", "BOX PLACEMENT", "OWN LAST MILE"],
        inquiry: ["ITEMS INQUIRY", "LOCATION INQUIRY", "CONTAINER INQUIRY", "PALLET INQUIRY"]
    };

    const webPageOptions = [
        "Activity Log",
        "Analytics",
        "App Configuration",
        "Area Management",
        "attribute-type",
        "Classification",
        "Classification Batch",
        "company",
        "customers",
        "Container",
        "Container Type",
        "CostVarianceReport",
        "Dashboard",
        "Demaged/Out of Stock",
        "direct-store-delivery",
        "Disposition",
        "facility",
        "Finished Goods",
        "fulfilment-box",
        "fulfilment-location",
        "fulfilment-slot",
        "fulfilment-wall",
        "load-unit",
        "Manage BOM Batches",
        "Manage Recipe",
        "Manage Resource Group",
        "Manage Routing Group",
        "Manufacturing",
        "orders",
        "product",
        "purchase-order",
        "purchase-order-receiving",
        "Raw Material",
        "Reports",
        "Resource",
        "role-management",
        "Routing",
        "Schedule Classification Job",
        "Scrap Management",
        "Settings",
        "storage",
        "Store",
        "System Configuration",
        "transport-unit",
        "transport-unit-location-type",
        "transport-unit-size",
        "unit-of-measurement",
        "user-management",
        "vendor",
        "warehouse",
        "workspace",
        "warehouse-zone",
        "Wave",
        "transportation-unit",
        "return-delivery",
        "delivery"
    ];

    // -------------------- FETCH ROLE --------------------
    const fetchRole = async () => {
        try {
            const res = await apiClient.get(`/roles/${id}?includeDeleted=true`);
            const role: RoleResponse = res.data.data;

            setForm({
                name: role.Name,
                description: role.Description,
                status: role.Status,
                WorkspaceId: role.WorkspaceId || null,
                warehouseId: role.WarehouseId?.toString() || "",
                isMobile: !role.IsWebRole,
                isWeb: role.IsWebRole,
                claims: role.RoleClaim.map(claim => ({
                    claimType: claim.ClaimType,
                    claimValue: claim.ClaimValue
                }))
            });
        } catch (err) {
            setError("Failed to fetch role data");
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await apiClient.get("/warehouses?page=1&limit=100&status=1");
            setWarehouses(res.data.data);
        } catch {
            setError("Failed to load warehouses");
        }
    };

    //   const fetchWorkspaces = async () => {
    //     try {
    //       const res = await apiClient.get("/workspace?page=1&limit=10");
    //       setWorkspaces(res.data.data);
    //       setShowWorkspaces(true);
    //     } catch {
    //       setError("Failed to load workspaces");
    //     }
    //   };

    useEffect(() => {
        Promise.all([fetchRole(),
        fetchWarehouses(),
            //  fetchWorkspaces()
        ])
            .finally(() => setLoading(false));
    }, []);

    const handleInputChange = (name: keyof RoleData, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleTypeChange = (type: 'mobile' | 'web') => {
        setForm(prev => ({
            ...prev,
            isMobile: type === 'mobile',
            isWeb: type === 'web'
        }));
    };

    const handleCheckboxChange = (value: string, isWeb: boolean = false) => {
        setForm(prev => {
            const claimValue = isWeb ? value.toLowerCase().replace(/\s+/g, "_") : value.toLowerCase();
            const exists = prev.claims.some(c => c.claimValue === claimValue);
            let newClaims = exists
                ? prev.claims.filter(c => c.claimValue !== claimValue)
                : [...prev.claims, { claimType: "permission", claimValue }];

            return { ...prev, claims: newClaims };
        });
    };

    const handleToggleAll = (section: string | null, isWeb: boolean = false) => {
        setForm(prev => {
            let newClaims = [...prev.claims];

            if (isWeb) {
                const shouldSelect = !selectAllWeb;
                webPageOptions.forEach(option => {
                    const claimValue = option.toLowerCase().replace(/\s+/g, "_");
                    if (shouldSelect && !newClaims.some(c => c.claimValue === claimValue)) {
                        newClaims.push({ claimType: "permission", claimValue });
                    } else if (!shouldSelect) {
                        newClaims = newClaims.filter(c => c.claimValue !== claimValue);
                    }
                });
                setSelectAllWeb(shouldSelect);
            } else if (section) {
                const options = mobilePageOptions[section as keyof typeof mobilePageOptions];
                const shouldSelect = !selectAllSections[section];
                options.forEach(option => {
                    const claimValue = option.toLowerCase();
                    if (shouldSelect && !newClaims.some(c => c.claimValue === claimValue)) {
                        newClaims.push({ claimType: "permission", claimValue });
                    } else if (!shouldSelect) {
                        newClaims = newClaims.filter(c => c.claimValue !== claimValue);
                    }
                });
                setSelectAllSections(prev => ({ ...prev, [section]: shouldSelect }));
            } else {
                const allMobileOptions = Object.values(mobilePageOptions).flat();
                const shouldSelect = !selectAllMobile;
                allMobileOptions.forEach(option => {
                    const claimValue = option.toLowerCase();
                    if (shouldSelect && !newClaims.some(c => c.claimValue === claimValue)) {
                        newClaims.push({ claimType: "permission", claimValue });
                    } else if (!shouldSelect) {
                        newClaims = newClaims.filter(c => c.claimValue !== claimValue);
                    }
                });
                setSelectAllMobile(shouldSelect);
            }

            return { ...prev, claims: newClaims };
        });
    };

    const submit = async () => {
        setError(null);

        if (!form.name || !form.warehouseId || (!form.isMobile && !form.isWeb)) {
            setError("All required fields must be filled");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                warehouseId: parseInt(form.warehouseId, 10),
                WorkspaceId: form.WorkspaceId,
                status: form.status,
                isWebRole: form.isWeb,
                claims: form.claims
            };

            await apiClient.put(`/roles/${id}`, payload);
            router.replace("/auth/roles" as any);
        } catch {
            setError("Failed to update role");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0284C7" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#0284C7" />
                </Pressable>


                <Text style={styles.title}>Edit Role</Text>
            </View>
            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.label}>Role Name *</Text>
            <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={v => handleInputChange("name", v)}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                value={form.description}
                onChangeText={v => handleInputChange("description", v)}
            />

            <Text style={styles.label}>Warehouse *</Text>
            {warehouses.map(w => (
                <TouchableOpacity
                    key={w.id}
                    style={[
                        styles.roleItem,
                        form.warehouseId === w.id.toString() && styles.roleActive
                    ]}
                    onPress={() => handleInputChange("warehouseId", w.id.toString())}
                >
                    <Text>{w.name}</Text>
                </TouchableOpacity>
            ))}

            {showWorkspaces && (
                <>
                    <Text style={styles.label}>Workspace</Text>
                    {workspaces.map(w => (
                        <TouchableOpacity
                            key={w.Id}
                            style={[
                                styles.roleItem,
                                form.WorkspaceId === w.Id && styles.roleActive
                            ]}
                            onPress={() => handleInputChange("WorkspaceId", w.Id)}
                        >
                            <Text>{w.Name}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}

            <Text style={styles.label}>Role Type *</Text>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <TouchableOpacity
                    style={[
                        styles.roleItem,
                        form.isMobile && styles.roleActive,
                        { marginRight: 8 }
                    ]}
                    onPress={() => handleRoleTypeChange("mobile")}
                >
                    <Text>Mobile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.roleItem, form.isWeb && styles.roleActive]}
                    onPress={() => handleRoleTypeChange("web")}
                >
                    <Text>Web</Text>
                </TouchableOpacity>
            </View>

            {/* ---------------- MOBILE PERMISSIONS ---------------- */}
            {form.isMobile && Object.entries(mobilePageOptions).map(([section, options]) => (
                <View key={section} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.label}>{section.toUpperCase()}</Text>
                        <Switch
                            value={selectAllSections[section] || false}
                            onValueChange={() => handleToggleAll(section, false)}
                        />
                    </View>
                    {options.map(option => (
                        <View key={option} style={{ flexDirection: "row", alignItems: "center" }}>
                            <Switch
                                value={form.claims.some(c => c.claimValue === option.toLowerCase())}
                                onValueChange={() => handleCheckboxChange(option)}
                            />
                            <Text style={{ marginLeft: 8 }}>{option}</Text>
                        </View>
                    ))}
                </View>
            ))}

            {/* ---------------- WEB PERMISSIONS ---------------- */}
            {form.isWeb && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Web Permissions</Text>
                    {webPageOptions.map(option => (
                        <View key={option} style={{ flexDirection: "row", alignItems: "center" }}>
                            <Switch
                                value={form.claims.some(c => c.claimValue === option.toLowerCase().replace(/\s+/g, "_"))}
                                onValueChange={() => handleCheckboxChange(option, true)}
                            />
                            <Text style={{ marginLeft: 8 }}>{option}</Text>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={styles.btn}
                onPress={submit}
                disabled={saving}
            >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#F0F9FF" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    label: { fontSize: 14, marginBottom: 6, fontWeight: "600" },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },

    roleItem: {
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 6,
        borderRadius: 8,
    },
    roleActive: { borderWidth: 1, borderColor: "#0284C7" },

    btn: {
        backgroundColor: "#0284C7",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginVertical: 24,
    },
    btnText: { color: "#fff", fontWeight: "600" },

    error: { color: "red", marginBottom: 10 },
    topHeader: { flexDirection: "row", justifyContent: "flex-start", gap: 8, alignItems: "center", marginBottom: 16 },
    title: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
    backBtn: { padding: 6, backgroundColor: "#E0F2FE", borderRadius: 10 },

});
