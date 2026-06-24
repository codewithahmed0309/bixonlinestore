import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Admin,
  authApi,
  LoginPayload,
  tokenStorage,
} from "../api/api";

import { isTokenValid } from "../utils/token";

interface AuthContextValue {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ADMIN_KEY = "ml_admin_profile";

/* ---------------- SAFE PARSE ---------------- */
const safeParse = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(tokenStorage.get());

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const storedToken = tokenStorage.get();
    const storedAdmin = safeParse(localStorage.getItem(ADMIN_KEY));

    if (storedToken && storedAdmin && isTokenValid(storedToken)) {
      setToken(storedToken);
      setAdmin(storedAdmin);
    } else {
      tokenStorage.clear();
      localStorage.removeItem(ADMIN_KEY);
      setToken(null);
      setAdmin(null);
    }

    setIsLoading(false);
  }, []);

  /* ---------------- LOGIN ---------------- */
  const login = async (payload: LoginPayload) => {
    try {
      const res = await authApi.login(payload);

      const { token: newToken, admin: loggedInAdmin } = res.data;

      if (!newToken || !loggedInAdmin) {
        throw new Error("Invalid login response");
      }

      tokenStorage.set(newToken);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(loggedInAdmin));

      setToken(newToken);
      setAdmin(loggedInAdmin);
    } catch (err) {
      console.error("Login failed:", err);

      // IMPORTANT: throw clean error for UI
      throw new Error("Invalid email or password");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    tokenStorage.clear();
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  };

  /* ---------------- AUTH STATE ---------------- */
  const isAuthenticated = useMemo(() => {
    return Boolean(token && admin && isTokenValid(token));
  }, [token, admin]);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [admin, isAuthenticated, isLoading]
  );

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};