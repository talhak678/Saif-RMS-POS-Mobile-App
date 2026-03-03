import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Role {
  roleId: number;
  roleName: string;
  roleType: number;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
}

export interface Workspace {
  Id: number;
  Name: string;
  Code: string;
  Status: number;
  DeletedDate: string | null;
}

export interface User {
  id: number;
  name: string;
  username: string | null;
  email: string;
  phoneNumber: string;
  warehouse: Warehouse;
  warehouseZone: any;
  roles: Role[];
  workspace: Workspace;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) setUserState(JSON.parse(json));
      } catch (err) {
        console.log("Failed to load user from storage:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Update user in context and AsyncStorage
  const setUser = async (u: User | null) => {
    try {
      setUserState(u);
      if (u) {
        await AsyncStorage.setItem("user", JSON.stringify(u));
      } else {
        await AsyncStorage.removeItem("user");
      }
    } catch (err) {
      console.log("Failed to save user to storage:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
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
