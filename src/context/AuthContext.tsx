import { logoutApi } from "@/src/api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  action: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface UserRestaurant {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  subscription?: string;
  subEndDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  restaurantId?: string;
  role?: UserRole;
  restaurant?: UserRestaurant;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  saveSession: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from AsyncStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedUser = await AsyncStorage.getItem("user_data");
        if (storedToken) setTokenState(storedToken);
        if (storedUser) setUserState(JSON.parse(storedUser));
      } catch (err) {
        console.log("Failed to load session:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Save token + user to state and AsyncStorage
  const saveSession = async (newToken: string, newUser: User) => {
    if (!newToken || !newUser) {
      console.error("saveSession called with missing data:", { newToken: !!newToken, newUser: !!newUser });
      return;
    }

    // 1. Must save to storage FIRST so interceptors/checkAuth can find it
    await AsyncStorage.setItem("auth_token", newToken);
    await AsyncStorage.setItem("user_data", JSON.stringify(newUser));

    // 2. Then update state to trigger re-renders
    setTokenState(newToken);
    setUserState(newUser);
  };

  // Update just the user object
  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      AsyncStorage.setItem("user_data", JSON.stringify(u));
    } else {
      AsyncStorage.removeItem("user_data");
    }
  };

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) {
      AsyncStorage.setItem("auth_token", t);
    } else {
      AsyncStorage.removeItem("auth_token");
    }
  };

  // Logout — call API, clear storage, navigate to login
  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Proceed with logout even if API fails
    } finally {
      setUserState(null);
      setTokenState(null);
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      router.replace("/(auth)/sign-in");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, setUser, setToken, saveSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
