import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import apiClient from "../src/api/apiClient"; // your axios instance
import { useAuth } from "../src/context/AuthContext";

export default function EditProfile() {
  const { user, setUser, loading } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phoneNumber);
    }
  }, [user]);

  if (loading) return <Text style={styles.loading}>Loading...</Text>;
  if (!user) return <Text style={styles.loading}>Not logged in</Text>;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Validation Error", "Phone number cannot be empty");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        id: user.id,
        name,
        phoneNumber: phone,
      };

      const res = await apiClient.put(`/users/${user.id}`, updateData);

      if (res.status === 200) {
        // Update context + AsyncStorage
        setUser({ ...user, name, phoneNumber: phone });
        Alert.alert("Success", "Profile updated successfully!");
        router.push("/(app)/(tabs)/profile");
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (err: any) {
      console.log(err.response?.data || err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Edit Profile</Text>

        <Input label="Name" value={name} onChange={setName} />
        <Input label="Phone Number" value={phone} onChange={setPhone} />
        <Input label="Email" value={user.email} editable={false} />
        <Input label="Role" value={user.roles[0]?.roleName || "-"} editable={false} />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Input({ label, value, onChange, editable = true }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        style={[styles.input, !editable && { backgroundColor: Colors.light.border }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: Colors.light.background },
  card: { backgroundColor: Colors.light.card, padding: 20, borderRadius: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  heading: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 20, color: Colors.light.text },
  label: { fontSize: 12, color: Colors.light.secondary, marginBottom: 4 },
  input: { fontSize: 16, backgroundColor: Colors.light.background, padding: 12, borderRadius: 10, color: Colors.light.text },
  button: { marginTop: 24, backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loading: { flex: 1, textAlign: "center", marginTop: 50, fontSize: 16, color: Colors.light.secondary },
});

