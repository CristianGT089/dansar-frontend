"use client";

import { BarChart3, Users, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyStore } from "@/lib/stores/company";
import { useAuthStore } from "@/lib/stores/auth";

const ROLE_LABEL: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Administrador",
  contador: "Contador",
  viewer: "Visualizador",
};

export default function EmpresaHomePage({ params }: { params: { companyId: string } }) {
  const { activeCompany } = useCompanyStore();
  const { companyRole } = useAuthStore();
  const role = companyRole(params.companyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{activeCompany?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {role ? ROLE_LABEL[role] : ""} · Panel de empresa
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Módulos activos", value: activeCompany?.features.length ?? 0, icon: TrendingUp },
          { title: "Dashboard Financiero", value: activeCompany?.features.includes("financial_dashboard") ? "Activo" : "Inactivo", icon: BarChart3 },
          { title: "Documentos", value: "—", icon: FileText },
          { title: "Usuarios", value: "—", icon: Users },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
