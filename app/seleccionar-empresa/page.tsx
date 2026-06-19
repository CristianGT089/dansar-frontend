"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { api } from "@/lib/api";
import type { UserCompany } from "@/types";

const ROLE_LABEL: Record<UserCompany["role"], string> = {
  superadmin: "Superadmin",
  admin: "Administrador",
  contador: "Contador",
  viewer: "Visualizador",
};

export default function SeleccionarEmpresaPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (user?.is_superadmin) router.replace("/admin");
    else if (user && user.companies.length === 1) router.replace(`/empresa/${user.companies[0].id}`);
  }, [isAuthenticated, user, router]);

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-primary">Dan-Sar</span>
          <span className="ml-1 text-sm text-muted-foreground">Contable</span>
          <p className="mt-2 text-sm text-muted-foreground">
            Hola, <strong>{user.full_name}</strong>. ¿A qué empresa deseas ingresar?
          </p>
        </div>

        {/* Company list */}
        <div className="space-y-2">
          {user.companies.map((company) => (
            <button
              key={company.id}
              onClick={() => router.push(`/empresa/${company.id}`)}
              className="flex w-full items-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{company.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABEL[company.role]}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
