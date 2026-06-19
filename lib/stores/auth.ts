"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserCompany } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;

  // Derived helpers
  companies: () => UserCompany[];
  hasCompanyAccess: (companyId: string) => boolean;
  companyRole: (companyId: string) => UserCompany["role"] | null;
  companyFeatures: (companyId: string) => string[];
  hasFeature: (companyId: string, feature: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);
        }
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      companies: () => get().user?.companies ?? [],

      hasCompanyAccess: (companyId) =>
        get().user?.is_superadmin ||
        (get().user?.companies ?? []).some((c) => c.id === companyId) ||
        false,

      companyRole: (companyId) =>
        get().user?.companies.find((c) => c.id === companyId)?.role ?? null,

      companyFeatures: (companyId) =>
        get().user?.companies.find((c) => c.id === companyId)?.features ?? [],

      hasFeature: (companyId, feature) =>
        get().user?.is_superadmin ||
        (get().user?.companies.find((c) => c.id === companyId)?.features ?? []).includes(feature) ||
        false,
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
