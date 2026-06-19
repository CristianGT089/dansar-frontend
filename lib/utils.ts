import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getRoleBadgeColor(role: string) {
  const map: Record<string, string> = {
    superadmin: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    contador: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-700",
  };
  return map[role] ?? "bg-gray-100 text-gray-700";
}
