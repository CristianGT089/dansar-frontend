"use client";

import { useState } from "react";
import { Plus, UserCircle2 } from "lucide-react";
import { useUsers, useCreateUser } from "@/lib/queries/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/user-form";

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
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
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
              </CardContent>
            </Card>
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
