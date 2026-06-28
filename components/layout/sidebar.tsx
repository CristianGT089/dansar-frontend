"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2, Users, LayoutDashboard, LogOut, CreditCard,
  ChevronRight, ChevronLeft, Menu, X,
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
  { href: "/modulos",  label: "Módulos",   icon: CreditCard, superadminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  // Cierra el drawer móvil al navegar
  useEffect(() => { setMobileOpen(false); }, [pathname]);

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

  const sidebarContent = (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        // Desktop: ancho colapsable
        "hidden md:flex",
        collapsed ? "md:w-16" : "md:w-60"
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

      <SidebarNav filtered={filtered} pathname={pathname} collapsed={collapsed} />

      <SidebarFooter
        user={user}
        collapsed={collapsed}
        onLogout={handleLogout}
      />

      {/* Collapse toggle — solo desktop */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-[54px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-fg shadow-sm transition-colors hover:text-sidebar-fg-active"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );

  return (
    <>
      {/* Botón hamburger — solo móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background shadow-sm md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
            {/* Header móvil */}
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
                  DS
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-fg-active leading-none">Dan-Sar</p>
                  <p className="text-[10px] text-sidebar-fg leading-tight mt-0.5">Contable</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-sidebar-fg hover:text-sidebar-fg-active"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <SidebarNav filtered={filtered} pathname={pathname} collapsed={false} />
            <SidebarFooter user={user} collapsed={false} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      {sidebarContent}
    </>
  );
}

function SidebarNav({
  filtered,
  pathname,
  collapsed,
}: {
  filtered: typeof navItems;
  pathname: string;
  collapsed: boolean;
}) {
  return (
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
  );
}

function SidebarFooter({
  user,
  collapsed,
  onLogout,
}: {
  user: any;
  collapsed: boolean;
  onLogout: () => void;
}) {
  return (
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
        onClick={onLogout}
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
  );
}
