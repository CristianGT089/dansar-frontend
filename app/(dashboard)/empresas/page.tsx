"use client";

import { useState } from "react";
import { Plus, Building2, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCompanies, useCreateCompany, useToggleCompanyStatus } from "@/lib/queries/companies";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CompanyForm } from "@/components/forms/company-form";
import { useAuthStore } from "@/lib/stores/auth";

export default function EmpresasPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const { data, isLoading } = useCompanies(page);
  const createCompany = useCreateCompany();
  const toggleStatus = useToggleCompanyStatus("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} empresa(s) registrada(s)` : "Cargando..."}
          </p>
        </div>
        {user?.is_superadmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nueva empresa</DialogTitle>
              </DialogHeader>
              <CompanyForm
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((company) => (
            <Card key={company.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.tax_id ?? "Sin NIT"} · {company.email ?? "Sin email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={company.is_active ? "success" : "destructive"}>
                    {company.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                  <Link href={`/empresas/${company.id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {data && data.total > data.page_size && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Página {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * data.page_size >= data.total}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
