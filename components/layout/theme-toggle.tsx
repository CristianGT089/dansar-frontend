"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ collapsed, variant = "sidebar" }: { collapsed?: boolean; variant?: "sidebar" | "sheet" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={cn(
        "flex items-center gap-3 rounded-md px-2 py-2 transition-colors w-full",
        variant === "sheet"
          ? "rounded-xl px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted"
          : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active"
      )}
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      {!collapsed && (
        <span className={variant === "sheet" ? "text-sm font-medium" : "text-xs font-medium"}>
          {isDark ? "Modo claro" : "Modo oscuro"}
        </span>
      )}
    </button>
  );
}
