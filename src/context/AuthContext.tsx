import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  cpf?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStoredData = useCallback(async () => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        userId: payload.userId || payload.sub,
        role: (payload.role?.replace("ROLE_", "") || "USER") as UserRole,
      };
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, refreshToken } = response.data;

      localStorage.setItem("access_token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      setToken(token);

      let userData: User;
      try {
        const userResponse = await api.get("/users/me");
        userData = userResponse.data;
      } catch {
        const decoded = decodeToken(token);
        userData = {
          id: decoded?.userId || "",
          name: "",
          email: email,
          role: decoded?.role || "USER",
        };
      }

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      const target = userData.role === "ADMIN" ? "/admin" : "/dashboard";
      navigate(target);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await api.post("/users", userData);
      navigate("/login");
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};