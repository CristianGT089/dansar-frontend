import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DashboardStats {
  companies: { total: number; active: number; inactive: number };
  users: { total: number; active: number; inactive: number };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/admin/dashboard");
      return data;
    },
    refetchInterval: 60_000,
  });
}
