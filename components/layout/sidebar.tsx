"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, Users, LayoutDashboard, LogOut, CreditCard, ChevronRight, ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { api } from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/admin",    label: "Dashboard", icon: LayoutDashboard, superadminOnly: true },
  { href: "/empresas", label: "Empresas",  icon: Building2 },
  { href: "/usuarios", label: "Usuarios",  icon: Users, superadminOnly: true },
  { href: "/planes",   label: "Planes",    icon: CreditCard, superadminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/login");
  }

  const filtered = navItems.filter((item) => !item.superadminOnly || user?.is_superadmin);

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-14 items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-2"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
          DS
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-fg-active leading-none">Dan-Sar</p>
            <p className="text-[10px] text-sidebar-fg leading-tight mt-0.5">Contable</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {filtered.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "",
                active
                  ? "bg-primary/15 text-sidebar-active"
                  : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-active")} />
              {!collapsed && <span className="text-xs">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-active" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <ThemeToggle collapsed={collapsed} />

        {!collapsed && (
          <div className="px-2 py-1.5">
            <p className="truncate text-xs font-medium text-sidebar-fg-active">{user?.full_name}</p>
            <p className="truncate text-[10px] text-sidebar-fg">{user?.email}</p>
            {user?.is_superadmin && (
              <span className="mt-1 inline-block rounded-sm bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Superadmin
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-xs text-sidebar-fg transition-colors hover:bg-red-500/10 hover:text-red-400",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[54px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-fg shadow-sm transition-colors hover:text-sidebar-fg-active"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
