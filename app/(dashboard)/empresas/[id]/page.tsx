"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ToggleLeft, ToggleRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { useCompany, useToggleCompanyStatus } from "@/lib/queries/companies";
import { useCompanyUsers, useAssignUserToCompany, useRemoveUserFromCompany, useUsers } from "@/lib/queries/users";
import { useCompanyFeatures, useToggleFeature } from "@/lib/queries/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth";
import { getRoleBadgeColor } from "@/lib/utils";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"usuarios" | "features">("usuarios");
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");

  const { data: company, isLoading } = useCompany(id);
  const { data: companyUsers } = useCompanyUsers(id);
  const { data: features } = useCompanyFeatures(id);
  const { data: allUsers } = useUsers();
  const toggleStatus = useToggleCompanyStatus(id);
  const toggleFeature = useToggleFeature(id);
  const removeUser = useRemoveUserFromCompany(id);
  const assignUser = useAssignUserToCompany(id);

  const assignedIds = new Set(companyUsers?.map((u) => u.user_id));
  const availableUsers = allUsers?.items.filter((u) => !assignedIds.has(u.id) && !u.is_superadmin) ?? [];

  async function handleAssign() {
    if (!selectedUserId) return;
    await assignUser.mutateAsync({ user_id: selectedUserId, role: selectedRole });
    setShowAddUser(false);
    setSelectedUserId("");
    setSelectedRole("viewer");
  }

  if (isLoading) return <div className="animate-pulse text-muted-foreground">Cargando...</div>;
  if (!company) return <div>Empresa no encontrada</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/empresas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{company.legal_name ?? company.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={company.is_active ? "success" : "destructive"}>
            {company.is_active ? "Activa" : "Inactiva"}
          </Badge>
          {user?.is_superadmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleStatus.mutate()}
              disabled={toggleStatus.isPending}
            >
              {company.is_active ? (
                <><ToggleRight className="mr-2 h-4 w-4 text-green-500" /> Desactivar</>
              ) : (
                <><ToggleLeft className="mr-2 h-4 w-4" /> Activar</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><p className="text-xs text-muted-foreground">NIT / Tax ID</p><p className="font-medium">{company.tax_id ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{company.email ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Teléfono</p><p className="font-medium">{company.phone ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Dirección</p><p className="font-medium">{company.address ?? "—"}</p></div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["usuarios", "features"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "features" ? "Funcionalidades" : "Usuarios"}
          </button>
        ))}
      </div>

      {/* Tab: Usuarios */}
      {tab === "usuarios" && (
        <div className="space-y-3">
          {user?.is_superadmin && (
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAddUser(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar usuario
              </Button>
            </div>
          )}
          {companyUsers?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay usuarios asignados a esta empresa
            </p>
          )}
          {companyUsers?.map((entry) => (
            <Card key={entry.user_id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{entry.user.full_name}</p>
                  <p className="text-sm text-muted-foreground">{entry.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(entry.role)}`}>
                    {entry.role}
                  </span>
                  {user?.is_superadmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeUser.mutate(entry.user_id)}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Agregar usuario */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar usuario a {company.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Usuario</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Selecciona un usuario...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="contador">Contador</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancelar</Button>
              <Button onClick={handleAssign} disabled={!selectedUserId || assignUser.isPending}>
                {assignUser.isPending ? "Asignando..." : "Asignar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tab: Features */}
      {tab === "features" && (
        <div className="space-y-3">
          {features?.map((feature) => (
            <Card key={feature.feature_id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.module} · {feature.key}</p>
                </div>
                {user?.is_superadmin ? (
                  <button
                    onClick={() =>
                      toggleFeature.mutate({ feature_key: feature.key, enabled: !feature.enabled })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      feature.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        feature.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                ) : (
                  <Badge variant={feature.enabled ? "success" : "secondary"}>
                    {feature.enabled ? "Activa" : "Inactiva"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
