"use client";

import { useState } from "react";
import { Plus, UserCircle2, ChevronDown, ChevronRight, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUsers, useCreateUser } from "@/lib/queries/users";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/user-form";
import type { UserCompanyRole } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  contador: "Contador",
  viewer: "Visualizador",
};

function useUserCompanies(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["users", userId, "companies"],
    queryFn: async () => {
      const { data } = await api.get<UserCompanyRole[]>(`/users/${userId}/companies`);
      return data;
    },
    enabled,
  });
}

function useChangeRoleGlobal(companyId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: string) =>
      api.patch(`/companies/${companyId}/users/${userId}/role`, { role }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", userId, "companies"] });
      toast.success("Rol actualizado correctamente");
    },
    onError: () => toast.error("No se pudo cambiar el rol"),
  });
}

function UserRow({ user }: { user: { id: string; full_name: string; email: string; is_active: boolean; is_superadmin: boolean } }) {
  const [expanded, setExpanded] = useState(false);
  const { data: memberships, isLoading } = useUserCompanies(user.id, expanded);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-muted-foreground hover:text-foreground"
              disabled={user.is_superadmin}
            >
              {user.is_superadmin ? (
                <div className="h-4 w-4" />
              ) : expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <UserCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.is_superadmin && (
              <Badge className="bg-purple-100 text-purple-800 border-0">Superadmin</Badge>
            )}
            <Badge variant={user.is_active ? "success" : "destructive"}>
              {user.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        {expanded && (
          <div className="border-t divide-y bg-muted/20">
            {isLoading ? (
              <div className="px-6 py-3 text-sm text-muted-foreground animate-pulse">Cargando empresas...</div>
            ) : memberships?.length === 0 ? (
              <div className="px-6 py-3 text-sm text-muted-foreground">Sin empresas asignadas</div>
            ) : (
              memberships?.map((m) => (
                <CompanyRoleRow key={m.company_id} membership={m} userId={user.id} />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompanyRoleRow({ membership, userId }: { membership: UserCompanyRole; userId: string }) {
  const companyId = membership.company_id;
  const changeRole = useChangeRoleGlobal(companyId, userId);

  return (
    <div className="flex items-center justify-between px-6 py-3 pl-16">
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">{membership.company?.name ?? companyId}</span>
      </div>
      <select
        value={membership.role}
        onChange={(e) => changeRole.mutate(e.target.value)}
        disabled={changeRole.isPending}
        className="rounded-md border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
      >
        {["admin", "contador", "viewer"].map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>
    </div>
  );
}

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useUsers(page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} usuario(s) registrado(s)` : "Cargando..."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
            </DialogHeader>
            <UserForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}

          {data && data.total > data.page_size && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">Página {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * data.page_size >= data.total}>
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
