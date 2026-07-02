import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompanyFeaturesResponse, FeatureStatus, Module, SubRole } from "@/types";

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data } = await api.get<Module[]>("/modules");
      return data;
    },
  });
}

export function useCompanyFeatures(companyId: string) {
  return useQuery({
    queryKey: ["companies", companyId, "features"],
    queryFn: async () => {
      const { data } = await api.get<CompanyFeaturesResponse>(`/companies/${companyId}/module`);
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
      api.post(`/companies/${companyId}/module/features/toggle`, payload).then((r) => r.data),
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
      api.patch(`/companies/${companyId}/module/features/${featureKey}/toggle`, { enabled }).then((r) => r.data),
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
      api.patch(`/companies/${companyId}/module/features/${featureKey}/roles`, { roles }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies", companyId, "features"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useAssignModule(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (module_type: string) =>
      api.post(`/companies/${companyId}/module/assign`, { module_type }).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["companies", companyId] }),
  });
}
