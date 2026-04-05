import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppUser, initialUsers, type RoleType } from "@/lib/mockData";

export interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string, role: RoleType) => Promise<void>;
  logout: () => void;
  canView: boolean;
  canAnalyze: boolean;
  canManage: boolean;
}

const STORAGE_KEY = "finance-dashboard-user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): AppUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AppUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: RoleType) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.trim().length < 6) {
      throw new Error("Please enter a valid email and password with at least 6 characters.");
    }

    const existing = initialUsers.find((item) => item.email === normalizedEmail);
    const nextUser: AppUser = existing
      ? {
          ...existing,
          role,
          status: existing.status,
        }
      : {
          id: `u-${Date.now()}`,
          name: normalizedEmail.split("@")[0].replace(/\.|_/g, " "),
          email: normalizedEmail,
          role,
          status: "Active",
        };

    if (nextUser.status === "Inactive") {
      throw new Error("This user is currently inactive.");
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const canView = !!user && ["viewer", "analyst", "admin"].includes(user.role);
  const canAnalyze = !!user && ["analyst", "admin"].includes(user.role);
  const canManage = !!user && user.role === "admin";

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      canView,
      canAnalyze,
      canManage,
    }),
    [user, loading, canView, canAnalyze, canManage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
