"use client";

import { ShieldOff } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { api } from "@/lib/api";

export default function SinAccesoPage() {
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 text-center">
      <ShieldOff className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Sin acceso a empresas</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tu cuenta <strong>{user?.email}</strong> no tiene acceso a ninguna empresa todavía.
        Contacta al administrador para que te asigne acceso.
      </p>
      <button
        onClick={handleLogout}
        className="mt-2 text-sm text-destructive underline underline-offset-2"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
