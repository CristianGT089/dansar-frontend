import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompanyFeatureItem, Plan } from "@/types";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await api.get<Plan[]>("/plans");
      return data;
    },
  });
}

export function useCompanyFeatures(companyId: string) {
  return useQuery({
    queryKey: ["companies", companyId, "features"],
    queryFn: async () => {
      const { data } = await api.get<{ company_id: string; features: CompanyFeatureItem[] }>(
        `/companies/${companyId}/plan`
      );
      return data.features;
    },
    enabled: !!companyId,
  });
}

export function useToggleFeature(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { feature_key: string; enabled: boolean }) =>
      api.post(`/companies/${companyId}/plan/features/toggle`, payload).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["companies", companyId, "features"] }),
  });
}

export function useAssignPlan(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan_type: string) =>
      api.post(`/companies/${companyId}/plan/assign`, { plan_type }).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["companies", companyId] }),
  });
}
