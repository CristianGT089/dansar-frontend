"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart3, BookOpen, PieChart,
  LogOut, Building2, ChevronRight, ChevronLeft, Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { useCompanyStore } from "@/lib/stores/company";
import { api } from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  feature?: string;
  sub?: boolean;
}

function getNavItems(companyId: string): NavItem[] {
  return [
    { href: `/empresa/${companyId}`,                          label: "Inicio",        icon: LayoutDashboard },
    { href: `/empresa/${companyId}/financiero`,               label: "Financiero",    icon: BarChart3,  feature: "financial_dashboard" },
    { href: `/empresa/${companyId}/financiero/graficos`,      label: "Gráficos",      icon: PieChart,   feature: "financial.charts",    sub: true },
    { href: `/empresa/${companyId}/financiero/libro-mayor`,   label: "Libro Mayor",   icon: BookOpen,   feature: "financial.libro_mayor", sub: true },
    { href: `/empresa/${companyId}/configuracion`,            label: "Configuración", icon: Settings },
  ];
}

export function CompanySidebar({ companyId }: { companyId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasFeature, companies } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/login");
  }

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  const userCompanies = companies();
  const navItems = getNavItems(companyId).filter(
    (item) => !item.feature || hasFeature(companyId, item.feature)
  );

  // Título de la sección activa para el top bar móvil
  const activeItem = navItems.find((item) =>
    item.sub ? pathname === item.href : pathname.startsWith(item.href)
  );

  const switchCompanyButton = userCompanies.length > 1 ? (
    <button
      onClick={() => router.push("/seleccionar-empresa")}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
      <Building2 className="h-5 w-5 shrink-0" />
      Cambiar empresa
    </button>
  ) : undefined;

  return (
    <>
      {/* Top bar + sheet — solo móvil/tablet (<lg) */}
      <MobileNav
        navItems={navItems}
        title={activeItem?.label ?? activeCompany?.name ?? "Empresa"}
        subtitle={activeCompany?.name}
        logoInitials={(activeCompany?.name?.slice(0, 2) ?? "DS").toUpperCase()}
        extraFooter={switchCompanyButton}
      />

      {/* Sidebar — solo desktop (lg+) */}
      <aside
        className={cn(
          "relative hidden lg:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Empresa header */}
        <div className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "gap-2"
        )}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/20 text-[10px] font-bold text-primary uppercase">
            {activeCompany?.name?.slice(0, 2) ?? "DS"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-sidebar-fg-active leading-none">
                {activeCompany?.name ?? "Empresa"}
              </p>
              <p className="text-[10px] text-sidebar-fg leading-tight mt-0.5 capitalize">
                {activeCompany?.role ?? "viewer"}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-2 pt-3">
          {navItems.map((item) => {
            const active = item.sub
              ? pathname === item.href
              : pathname === item.href || (!item.sub && pathname.startsWith(item.href) && item.href !== `/empresa/${companyId}`);
            const exactActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-md py-2.5 text-xs font-medium transition-colors",
                  item.sub && !collapsed ? "pl-7 pr-2" : "px-2",
                  collapsed ? "justify-center" : "",
                  exactActive
                    ? "bg-primary/15 text-sidebar-active"
                    : active && !item.sub
                    ? "text-sidebar-fg-active"
                    : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", exactActive && "text-sidebar-active")} />
                {!collapsed && <span>{item.label}</span>}
                {exactActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-active" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-0.5">
          <ThemeToggle collapsed={collapsed} />

          {userCompanies.length > 1 && (
            <button
              onClick={() => router.push("/seleccionar-empresa")}
              title={collapsed ? "Cambiar empresa" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-xs text-sidebar-fg transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg-active",
                collapsed && "justify-center"
              )}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              {!collapsed && "Cambiar empresa"}
            </button>
          )}

          {!collapsed && (
            <div className="px-2 py-1.5">
              <p className="truncate text-xs font-medium text-sidebar-fg-active">{user?.full_name}</p>
              <p className="truncate text-[10px] text-sidebar-fg">{user?.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-xs text-sidebar-fg transition-colors hover:bg-red-500/10 hover:text-red-400",
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
    </>
  );
}
