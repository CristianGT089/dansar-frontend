"use client";

import { useState } from "react";
import { Plus, UserCircle2, ChevronDown, ChevronRight, Building2, Users, Trash2, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUsers, useCreateUser, useCompanyUsers, useAssignUserToCompany, useRemoveUserFromCompany, useChangeUserRole } from "@/lib/queries/users";
import { useCompanies } from "@/lib/queries/companies";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/user-form";
import { cn } from "@/lib/utils";
import type { UserCompanyRole, Company, User } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  contador: "Contador",
  viewer: "Visualizador",
};

// ── Vista por usuario ─────────────────────────────────────────────────────────

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

function UserRow({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();
  const { data: memberships, isLoading } = useUserCompanies(user.id, expanded);

  const changeRole = useMutation({
    mutationFn: ({ companyId, role }: { companyId: string; role: string }) =>
      api.patch(`/companies/${companyId}/users/${user.id}/role`, { role }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", user.id, "companies"] });
      toast.success("Rol actualizado");
    },
    onError: () => toast.error("No se pudo cambiar el rol"),
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setExpanded((e) => !e)}
              disabled={user.is_superadmin}
              className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-0"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <UserCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{user.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {user.is_superadmin && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-0">
                Superadmin
              </Badge>
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
                <div key={m.company_id} className="flex items-center justify-between px-4 py-3 pl-16">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{m.company?.name ?? m.company_id}</span>
                  </div>
                  <select
                    value={m.role}
                    onChange={(e) => changeRole.mutate({ companyId: m.company_id, role: e.target.value })}
                    disabled={changeRole.isPending}
                    className="rounded-md border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
                  >
                    {["admin", "contador", "viewer"].map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Vista por empresa ─────────────────────────────────────────────────────────

function CompanyMembersRow({ company, allUsers }: { company: Company; allUsers: User[] }) {
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const qc = useQueryClient();

  const { data: members, isLoading } = useCompanyUsers(company.id);

  const changeRole = useChangeUserRole(company.id);
  const removeUser = useRemoveUserFromCompany(company.id);
  const assignUser = useAssignUserToCompany(company.id);

  const memberIds = new Set(members?.map((m) => m.user_id));
  const availableUsers = allUsers.filter((u) => !u.is_superadmin && !memberIds.has(u.id));

  async function handleAdd() {
    if (!selectedUserId) return;
    try {
      await assignUser.mutateAsync({ user_id: selectedUserId, role: selectedRole });
      toast.success("Usuario agregado");
      setAddOpen(false);
      setSelectedUserId("");
    } catch {
      toast.error("No se pudo agregar el usuario");
    }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`¿Remover a ${name} de ${company.name}?`)) return;
    try {
      await removeUser.mutateAsync(userId);
      toast.success("Usuario removido");
    } catch {
      toast.error("No se pudo remover el usuario");
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header de empresa */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{company.name}</p>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "..." : `${members?.length ?? 0} miembro(s)`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Badge variant={company.is_active ? "success" : "destructive"}>
              {company.is_active ? "Activa" : "Inactiva"}
            </Badge>
            {expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            }
          </div>
        </button>

        {/* Lista de miembros */}
        {expanded && (
          <div className="border-t bg-muted/10">
            {isLoading ? (
              <div className="px-6 py-4 text-sm text-muted-foreground animate-pulse">Cargando miembros...</div>
            ) : members?.length === 0 ? (
              <div className="px-6 py-4 text-sm text-muted-foreground">Sin miembros asignados</div>
            ) : (
              <div className="divide-y">
                {members?.map((m) => (
                  <div key={m.user_id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.user?.full_name ?? m.user_id}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={m.is_active ? "success" : "secondary"} className="hidden sm:inline-flex">
                        {m.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <select
                        value={m.role}
                        onChange={(e) => {
                          changeRole.mutate(
                            { userId: m.user_id, role: e.target.value },
                            { onSuccess: () => toast.success("Rol actualizado"), onError: () => toast.error("Error al cambiar rol") }
                          );
                        }}
                        disabled={changeRole.isPending}
                        className="rounded-md border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
                      >
                        {["admin", "contador", "viewer"].map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemove(m.user_id, m.user?.full_name ?? "usuario")}
                        disabled={removeUser.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
                        title="Remover de empresa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar usuario existente */}
            <div className="border-t px-4 py-3">
              {addOpen ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 min-w-0 rounded-md border bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="">Seleccionar usuario...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-md border bg-background px-2 py-1.5 text-sm"
                  >
                    {["admin", "contador", "viewer"].map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAdd} disabled={!selectedUserId || assignUser.isPending}>
                    Agregar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Agregar usuario existente
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

type ViewMode = "usuarios" | "empresas";

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("usuarios");

  const { data: usersData, isLoading: loadingUsers } = useUsers(page);
  const { data: companiesData, isLoading: loadingCompanies } = useCompanies(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">
            {usersData ? `${usersData.total} usuario(s) registrado(s)` : "Cargando..."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de vista */}
          <div className="flex items-center rounded-lg border p-0.5 text-sm">
            <button
              onClick={() => setView("usuarios")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                view === "usuarios"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Por usuario
            </button>
            <button
              onClick={() => setView("empresas")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors",
                view === "empresas"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Por empresa
            </button>
          </div>

          {/* Botón nuevo usuario — solo en vista usuarios */}
          {view === "usuarios" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo usuario</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear nuevo usuario</DialogTitle>
                </DialogHeader>
                <UserForm onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Vista: Por usuario */}
      {view === "usuarios" && (
        <>
          {loadingUsers ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {usersData?.items.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
              <Pagination
                page={page}
                total={usersData?.total ?? 0}
                pageSize={usersData?.page_size ?? 20}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </>
      )}

      {/* Vista: Por empresa */}
      {view === "empresas" && (
        <>
          {loadingCompanies || loadingUsers ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {companiesData?.items.map((company) => (
                <CompanyMembersRow
                  key={company.id}
                  company={company}
                  allUsers={usersData?.items ?? []}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Pagination({
  page, total, pageSize, onPrev, onNext,
}: {
  page: number; total: number; pageSize: number; onPrev: () => void; onNext: () => void;
}) {
  if (total <= pageSize) return null;
  return (
    <div className="flex justify-center gap-2 pt-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 1}>Anterior</Button>
      <span className="flex items-center text-sm text-muted-foreground">Página {page}</span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page * pageSize >= total}>Siguiente</Button>
    </div>
  );
}
