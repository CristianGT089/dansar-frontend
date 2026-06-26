"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Settings, Users, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/lib/stores/auth";
import { useCompanyFeatures, useToggleSubfeature, useSetFeatureRoles, useToggleFeature } from "@/lib/queries/plans";
import { useCompanyUsers, useCreateUserForCompany, useChangeUserRole, useRemoveUserFromCompany } from "@/lib/queries/users";
import { FeatureTree } from "@/components/plans/feature-tree";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoleBadgeColor } from "@/lib/utils";
import type { SubRole } from "@/types";

type Tab = "funcionalidades" | "usuarios";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  contador: "Contador",
  viewer: "Visualizador",
};

export default function ConfiguracionPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { user, companyRole } = useAuthStore();
  const [tab, setTab] = useState<Tab>("funcionalidades");
  const [showCreate, setShowCreate] = useState(false);

  const isSuperadmin = !!user?.is_superadmin;
  const role = companyRole(companyId);
  const isAdmin = role === "admin";

  const { data: features, isLoading: featuresLoading } = useCompanyFeatures(companyId);
  const { data: companyUsers, isLoading: usersLoading } = useCompanyUsers(companyId);
  const toggleFeature = useToggleFeature(companyId);
  const toggleSubfeature = useToggleSubfeature(companyId);
  const setFeatureRoles = useSetFeatureRoles(companyId);
  const createUser = useCreateUserForCompany(companyId);
  const changeRole = useChangeUserRole(companyId);
  const removeUser = useRemoveUserFromCompany(companyId);

  function handleToggleSubfeature(key: string, enabled: boolean) {
    toggleSubfeature.mutate({ featureKey: key, enabled }, {
      onSuccess: () => toast.success(enabled ? "Funcionalidad activada" : "Funcionalidad desactivada"),
      onError: () => toast.error("No se pudo cambiar la funcionalidad"),
    });
  }

  function handleSetRoles(key: string, roles: SubRole[]) {
    setFeatureRoles.mutate({ featureKey: key, roles }, {
      onSuccess: () => toast.success("Roles actualizados"),
      onError: () => toast.error("No se pudo actualizar los roles"),
    });
  }

  function handleChangeRole(userId: string, role: string) {
    changeRole.mutate({ userId, role }, {
      onSuccess: () => toast.success("Rol actualizado correctamente"),
      onError: () => toast.error("No se pudo cambiar el rol"),
    });
  }

  function handleCreateUser(data: Parameters<typeof createUser.mutateAsync>[0]) {
    return createUser.mutateAsync(data).then(() => {
      toast.success("Usuario creado exitosamente");
    }).catch(() => {
      toast.error("No se pudo crear el usuario");
      throw new Error();
    });
  }

  function handleRemoveUser(userId: string) {
    removeUser.mutate(userId, {
      onSuccess: () => toast.success("Usuario removido de la empresa"),
      onError: () => toast.error("No se pudo remover el usuario"),
    });
  }

  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Settings className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona funcionalidades y usuarios de tu empresa.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["funcionalidades", "usuarios"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "funcionalidades" ? "Funcionalidades" : "Usuarios"}
          </button>
        ))}
      </div>

      {/* Tab: Funcionalidades */}
      {tab === "funcionalidades" && (
        featuresLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : features && features.length > 0 ? (
          <FeatureTree
            features={features}
            canToggleParent={isSuperadmin}
            canManageChildren={isSuperadmin || isAdmin}
            onToggleParent={(key, enabled) => toggleFeature.mutate({ feature_key: key, enabled })}
            onToggleChild={handleToggleSubfeature}
            onSetRoles={handleSetRoles}
            isPending={toggleFeature.isPending || toggleSubfeature.isPending || setFeatureRoles.isPending}
          />
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No hay funcionalidades configuradas para esta empresa.
          </p>
        )
      )}

      {/* Tab: Usuarios */}
      {tab === "usuarios" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>

          {usersLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : companyUsers?.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No hay usuarios en esta empresa.
            </p>
          ) : (
            companyUsers?.map((entry) => {
              const isMe = entry.user_id === user?.id;
              return (
                <Card key={entry.user_id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{entry.user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{entry.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isMe ? (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(entry.role)}`}>
                          {ROLE_LABELS[entry.role] ?? entry.role}
                        </span>
                      ) : (
                        <select
                          value={entry.role}
                          onChange={(e) => handleChangeRole(entry.user_id, e.target.value)}
                          disabled={changeRole.isPending}
                          className="rounded-md border bg-background px-2 py-1 text-xs font-medium"
                        >
                          {(isSuperadmin ? ["admin", "contador", "viewer"] : ["contador", "viewer"]).map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      )}
                      {!isMe && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveUser(entry.user_id)}
                          disabled={removeUser.isPending}
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Dialog: Crear usuario */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            isSuperadmin={isSuperadmin}
            onSuccess={() => setShowCreate(false)}
            onSubmit={handleCreateUser}
            isPending={createUser.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateUserForm({
  isSuperadmin,
  onSuccess,
  onSubmit: submitFn,
  isPending,
}: {
  isSuperadmin: boolean;
  onSuccess: () => void;
  onSubmit: (data: { full_name: string; email: string; password: string; role: string }) => Promise<void>;
  isPending: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    full_name: string;
    email: string;
    password: string;
    role: string;
  }>({ defaultValues: { role: "viewer" } });

  async function onSubmit(data: { full_name: string; email: string; password: string; role: string }) {
    await submitFn(data);
    reset();
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Nombre completo</Label>
        <Input {...register("full_name", { required: true })} placeholder="Juan Pérez" />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input {...register("email", { required: true })} type="email" placeholder="juan@empresa.com" />
      </div>
      <div className="space-y-1.5">
        <Label>Contraseña</Label>
        <Input {...register("password", { required: true, minLength: 8 })} type="password" placeholder="Mínimo 8 caracteres" />
        {errors.password && <p className="text-xs text-destructive">Mínimo 8 caracteres</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Rol</Label>
        <select
          {...register("role")}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {isSuperadmin && <option value="admin">Administrador</option>}
          <option value="contador">Contador</option>
          <option value="viewer">Visualizador</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
