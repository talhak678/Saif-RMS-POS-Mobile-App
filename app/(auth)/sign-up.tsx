
import { Link, router } from "expo-router";
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
import { registerApi } from "../../src/api/authApi";
import { isValidEmail, isValidPassword } from "../../src/utils/validation";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {

    // router.push(("(app)/company" as any))
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("First and Last name are required");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid email address");
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert("Please accept Terms & Conditions");
      return;
    }

    try {
      setLoading(true);
      const response = await registerApi({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      console.log("SignUp Response:", response.data);

      Alert.alert("Success", "Account created successfully", [
        { text: "Go to Sign In", onPress: () => router.replace("/(auth)/sign-in") },
      ]);
    } catch (error: any) {
      console.log("SignUp Error:", error.response?.data || error.message);
      Alert.alert(
        "Sign Up Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Enter your details to create an account</Text>

        <TextInput placeholder="First Name" style={styles.input} value={firstName} onChangeText={setFirstName} />
        <TextInput placeholder="Last Name" style={styles.input} value={lastName} onChangeText={setLastName} />
        <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
        <View style={styles.passwordWrapper}>
          <TextInput placeholder="Password" style={styles.passwordInput} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptedTerms(!acceptedTerms)}>
          <View style={[styles.checkbox, acceptedTerms && styles.checked]} />
          <Text style={styles.checkboxText}>I agree to the Terms & Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account? <Link href="/(auth)/sign-in" style={styles.link}>Sign In</Link>
        </Text>
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
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
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
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
  showText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 4,
    marginRight: 10,
  },
  checked: {
    backgroundColor: "#2563EB",
  },
  checkboxText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  button: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
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
