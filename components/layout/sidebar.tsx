"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { api } from "@/lib/api";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, superadminOnly: true },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/usuarios", label: "Usuarios", icon: Users, superadminOnly: true },
  { href: "/planes", label: "Planes", icon: CreditCard, superadminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {}
    logout();
  }

  const filtered = navItems.filter(
    (item) => !item.superadminOnly || user?.is_superadmin
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-primary">Dan-Sar</span>
        <span className="ml-1 text-sm text-muted-foreground">Contable</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {filtered.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t p-4">
        <div className="mb-2 px-3 py-1">
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          {user?.is_superadmin && (
            <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
              Superadmin
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
