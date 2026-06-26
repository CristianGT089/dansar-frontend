import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResponse, User, UserCompanyRole } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  list: (page: number) => ["users", "list", page] as const,
  detail: (id: string) => ["users", id] as const,
  companyUsers: (companyId: string) => ["companies", companyId, "users"] as const,
};

export function useUsers(page = 1) {
  return useQuery({
    queryKey: userKeys.list(page),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>("/users", {
        params: { page, page_size: 20 },
      });
      return data;
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; full_name: string; password: string }) =>
      api.post("/users", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useCompanyUsers(companyId: string) {
  return useQuery({
    queryKey: userKeys.companyUsers(companyId),
    queryFn: async () => {
      const { data } = await api.get<UserCompanyRole[]>(`/companies/${companyId}/users`);
      return data;
    },
    enabled: !!companyId,
  });
}

export function useAssignUserToCompany(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { user_id: string; role: string }) =>
      api.post(`/companies/${companyId}/users`, payload).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: userKeys.companyUsers(companyId) }),
  });
}

export function useRemoveUserFromCompany(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/companies/${companyId}/users/${userId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: userKeys.companyUsers(companyId) }),
  });
}

export function useCreateUserForCompany(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; full_name: string; password: string; role: string }) =>
      api.post(`/companies/${companyId}/users/create`, payload).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: userKeys.companyUsers(companyId) }),
  });
}

export function useChangeUserRole(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/companies/${companyId}/users/${userId}/role`, { role }).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: userKeys.companyUsers(companyId) }),
  });
}
