"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart3, BookOpen, PieChart,
  LogOut, Building2, ChevronRight, ChevronLeft, Settings, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { useCompanyStore } from "@/lib/stores/company";
import { api } from "@/lib/api";
import { ThemeToggle } from "./theme-toggle";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

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

  const userCompanies = companies();
  const navItems = getNavItems(companyId).filter(
    (item) => !item.feature || hasFeature(companyId, item.feature)
  );

  return (
    <>
      {/* Hamburger móvil */}
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/20 text-[10px] font-bold text-primary uppercase">
                  {activeCompany?.name?.slice(0, 2) ?? "DS"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-sidebar-fg-active leading-none">
                    {activeCompany?.name ?? "Empresa"}
                  </p>
                  <p className="text-[10px] text-sidebar-fg leading-tight mt-0.5 capitalize">
                    {activeCompany?.role ?? "viewer"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-sidebar-fg hover:text-sidebar-fg-active"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CompanyNav navItems={navItems} pathname={pathname} companyId={companyId} collapsed={false} />
            <CompanyFooter
              user={user}
              collapsed={false}
              userCompanies={userCompanies}
              onLogout={handleLogout}
              onSwitch={() => router.push("/seleccionar-empresa")}
            />
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside
        className={cn(
          "relative hidden md:flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          collapsed ? "md:w-16" : "md:w-60"
        )}
      >
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

        <CompanyNav navItems={navItems} pathname={pathname} companyId={companyId} collapsed={collapsed} />

        <CompanyFooter
          user={user}
          collapsed={collapsed}
          userCompanies={userCompanies}
          onLogout={handleLogout}
          onSwitch={() => router.push("/seleccionar-empresa")}
        />

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

function CompanyNav({
  navItems,
  pathname,
  companyId,
  collapsed,
}: {
  navItems: NavItem[];
  pathname: string;
  companyId: string;
  collapsed: boolean;
}) {
  return (
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
              "group flex items-center gap-3 rounded-md py-2 text-xs font-medium transition-colors",
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
  );
}

function CompanyFooter({
  user,
  collapsed,
  userCompanies,
  onLogout,
  onSwitch,
}: {
  user: any;
  collapsed: boolean;
  userCompanies: any[];
  onLogout: () => void;
  onSwitch: () => void;
}) {
  return (
    <div className="border-t border-sidebar-border p-2 space-y-0.5">
      <ThemeToggle collapsed={collapsed} />

      {userCompanies.length > 1 && (
        <button
          onClick={onSwitch}
          title={collapsed ? "Cambiar empresa" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-xs text-sidebar-fg transition-colors hover:bg-sidebar-hover hover:text-sidebar-fg-active",
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
