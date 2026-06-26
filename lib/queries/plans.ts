import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompanyFeaturesResponse, FeatureStatus, Plan, SubRole } from "@/types";

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
      const { data } = await api.get<CompanyFeaturesResponse>(`/companies/${companyId}/plan`);
      return data.features;
    },
    enabled: !!companyId,
  });
}

// Superadmin: toggle parent or any feature
export function useToggleFeature(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { feature_key: string; enabled: boolean }) =>
      api.post(`/companies/${companyId}/plan/features/toggle`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies", companyId, "features"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// Admin or superadmin: toggle subfeature only
export function useToggleSubfeature(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) =>
      api.patch(`/companies/${companyId}/plan/features/${featureKey}/toggle`, { enabled }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies", companyId, "features"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// Admin or superadmin: set allowed roles for a subfeature
export function useSetFeatureRoles(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ featureKey, roles }: { featureKey: string; roles: SubRole[] }) =>
      api.patch(`/companies/${companyId}/plan/features/${featureKey}/roles`, { roles }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies", companyId, "features"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
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
