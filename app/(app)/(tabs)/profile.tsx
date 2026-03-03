import apiClient from "@/src/api/apiClient";
import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const { user, setUser, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phoneNumber);
      setEmail(user.email);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Not logged in</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Validation Error", "Name & phone are required");
      return;
    }

    try {
      setSaving(true);

      const res = await apiClient.put(`/users/${user.id}`, {
        id: user.id,
        name,
        phoneNumber: phone,
        email,
      });

      if (res.status === 200) {
        setUser({ ...user, name, phoneNumber: phone });
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Update failed");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.heading}>My Profile</Text>

          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* NAME */}
        <ProfileField
          label="Name"
          value={name}
          editable={isEditing}
          onChange={setName}
        />

        {/* EMAIL */}
        <ProfileField
          label="Email"
          value={email}
          onChange={setEmail}
          editable={isEditing}
        />

        {/* PHONE */}
        <ProfileField
          label="Phone"
          value={phone}
          editable={isEditing}
          onChange={setPhone}
        />

        {/* ROLE */}
        <ProfileField
          label="Role"
          value={user.roles[0]?.roleName || "-"}
          editable={false}
        />

        {/* ACTION BUTTONS */}
        {isEditing && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={() => {
                setIsEditing(false);
                setName(user.name);
                setPhone(user.phoneNumber);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

/* 🔹 Reusable Field */
function ProfileField({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>

      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          style={styles.input}
        />
      ) : (
        <View style={styles.readBox}>
          <Text style={styles.readText}>{value}</Text>
        </View>
      )}
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    padding: 16,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C4A6E",
  },

  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0284C7",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  readBox: {
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
  },

  readText: {
    fontSize: 16,
    color: "#0F172A",
  },

  input: {
    fontSize: 16,
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 12,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },

  button: {
    flex: 1,
    backgroundColor: "#0284C7",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelBtn: {
    backgroundColor: "#E5E7EB",
  },

  cancelText: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
