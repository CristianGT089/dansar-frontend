import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company, PaginatedResponse } from "@/types";

export const companyKeys = {
  all: ["companies"] as const,
  list: (page: number) => ["companies", "list", page] as const,
  detail: (id: string) => ["companies", id] as const,
};

export function useCompanies(page = 1) {
  return useQuery({
    queryKey: companyKeys.list(page),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Company>>("/companies", {
        params: { page, page_size: 20 },
      });
      return data;
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<Company>(`/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Company>) => api.post("/companies", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Company>) =>
      api.patch(`/companies/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      qc.invalidateQueries({ queryKey: companyKeys.detail(id) });
    },
  });
}

export function useToggleCompanyStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/companies/${id}/toggle-status`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  });
}
