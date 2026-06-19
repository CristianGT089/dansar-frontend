"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BarChart3, BookOpen, PieChart, LogOut, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { useCompanyStore } from "@/lib/stores/company";
import { api } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  feature?: string;
}

function getNavItems(companyId: string): NavItem[] {
  return [
    { href: `/empresa/${companyId}`, label: "Inicio", icon: LayoutDashboard },
    { href: `/empresa/${companyId}/financiero`, label: "Dashboard Financiero", icon: BarChart3, feature: "financial_dashboard" },
    { href: `/empresa/${companyId}/financiero/graficos`, label: "Gráficos", icon: PieChart, feature: "financial_dashboard" },
    { href: `/empresa/${companyId}/financiero/libro-mayor`, label: "Libro Mayor", icon: BookOpen, feature: "financial_dashboard" },
  ];
}

export function CompanySidebar({ companyId }: { companyId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasFeature, companies } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const userCompanies = companies();

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
  }

  const navItems = getNavItems(companyId).filter(
    (item) => !item.feature || hasFeature(companyId, item.feature)
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo + empresa */}
      <div className="flex h-16 flex-col justify-center border-b px-6">
        <span className="text-lg font-bold text-primary">{activeCompany?.name ?? "Empresa"}</span>
        <span className="text-xs text-muted-foreground">Dan-Sar Contable</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const isSub = item.href.includes("/financiero/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors",
                isSub ? "pl-8 pr-3" : "px-3",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-1">
        {/* Cambiar empresa si tiene más de una */}
        {userCompanies.length > 1 && (
          <button
            onClick={() => router.push("/seleccionar-empresa")}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Building2 className="h-4 w-4" />
            Cambiar empresa
          </button>
        )}
        <div className="px-3 py-1">
          <p className="truncate text-sm font-medium">{user?.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
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
