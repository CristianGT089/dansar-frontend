"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Building2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import { api } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  superadminOnly?: boolean;
  feature?: string;
}

interface MobileNavProps {
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  /** Avatar initials or logo */
  logoInitials?: string;
  extraFooter?: React.ReactNode;
}

export function MobileNav({ navItems, title, subtitle, logoInitials = "DS", extraFooter }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  // Cierra al navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  // Bloquea scroll del body cuando el sheet está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleLogout() {
    try { await api.post("/auth/logout"); } catch {}
    logout();
    router.push("/login");
  }

  const filtered = navItems.filter((item) => !item.superadminOnly || user?.is_superadmin);

  return (
    <>
      {/* Top bar — solo visible en móvil/tablet (<lg) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            {logoInitials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none truncate">{title}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Abrir navegación"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sheet desde abajo */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-background border-t border-border shadow-xl animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header del sheet */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="font-semibold">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="px-3 py-3 space-y-1">
              {filtered.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors text-left",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer del sheet */}
            <div className="px-3 pb-3 pt-1 border-t border-border mt-1 space-y-1">
              {extraFooter}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Cerrar sesión
              </button>
            </div>

            {/* Safe area para dispositivos con home indicator */}
            <div className="h-safe-bottom pb-2" />
          </div>
        </div>
      )}
    </>
  );
}
