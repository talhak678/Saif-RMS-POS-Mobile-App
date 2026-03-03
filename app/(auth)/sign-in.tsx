import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginApi } from "../../src/api/authApi";
import { isValidEmail, isValidPassword } from "../../src/utils/validation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleSignIn = async () => {
  if (!isValidEmail(email)) {
    Alert.alert("Invalid email");
    return;
  }

  if (!isValidPassword(password)) {
    Alert.alert("Password must be at least 6 characters");
    return;
  }

  try {
    setLoading(true);

    const response = await loginApi({
      email,
      password,
    });

    const accessToken = response.data.data.tokens.accessToken;
    const user = response.data.data.user;

    await AsyncStorage.setItem("token", accessToken);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    router.replace("/");

  } catch (error: any) {
    Alert.alert(
      "Login Failed",
      error.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Access your account</Text>

        <TextInput
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create one
          </Link>
        </Text> */}
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
