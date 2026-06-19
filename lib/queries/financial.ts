import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const base = (id: string) => `/companies/${id}/financial`;

export function useFinancialMeta(companyId: string) {
  return useQuery({
    queryKey: ["financial", companyId, "meta"],
    queryFn: () => api.get(base(companyId) + "/meta").then(r => r.data),
    enabled: !!companyId,
  });
}

export function usePygMensual(companyId: string, yearA = 2024, yearB = 2026) {
  return useQuery({
    queryKey: ["financial", companyId, "pyg-mensual", yearA, yearB],
    queryFn: () => api.get(base(companyId) + "/pyg/mensual", { params: { year_a: yearA, year_b: yearB } }).then(r => r.data),
    enabled: !!companyId,
  });
}

export function usePygTrimestral(companyId: string, yearA = 2024, yearB = 2025) {
  return useQuery({
    queryKey: ["financial", companyId, "pyg-trimestral", yearA, yearB],
    queryFn: () => api.get(base(companyId) + "/pyg/trimestral", { params: { year_a: yearA, year_b: yearB } }).then(r => r.data),
    enabled: !!companyId,
  });
}

export function useSalesTrend(companyId: string) {
  return useQuery({
    queryKey: ["financial", companyId, "sales-trend"],
    queryFn: () => api.get(base(companyId) + "/charts/sales-trend").then(r => r.data),
    enabled: !!companyId,
  });
}

export function useSalesMix(companyId: string, year: number) {
  return useQuery({
    queryKey: ["financial", companyId, "sales-mix", year],
    queryFn: () => api.get(base(companyId) + "/charts/sales-mix", { params: { year } }).then(r => r.data),
    enabled: !!companyId,
  });
}

export function useQuarterlySales(companyId: string) {
  return useQuery({
    queryKey: ["financial", companyId, "quarterly-sales"],
    queryFn: () => api.get(base(companyId) + "/charts/quarterly-sales").then(r => r.data),
    enabled: !!companyId,
  });
}

export function useCategorySales(companyId: string) {
  return useQuery({
    queryKey: ["financial", companyId, "category-sales"],
    queryFn: () => api.get(base(companyId) + "/charts/category-sales").then(r => r.data),
    enabled: !!companyId,
  });
}

export function useLibroMayor(
  companyId: string,
  filters: { year?: number; month?: number; account?: string; cost_center?: string; page?: number }
) {
  return useQuery({
    queryKey: ["financial", companyId, "libro", filters],
    queryFn: () =>
      api.get(base(companyId) + "/libro", {
        params: { ...filters, page_size: 50 },
      }).then(r => r.data),
    enabled: !!companyId,
  });
}
