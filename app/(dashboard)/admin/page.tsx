"use client";

import { Building2, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/lib/queries/admin";

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-md p-2 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Error cargando el dashboard</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de la plataforma</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Empresas totales"
          value={data.companies.total}
          sub={`${data.companies.active} activas`}
          icon={Building2}
          color="bg-blue-500"
        />
        <StatCard
          title="Empresas activas"
          value={data.companies.active}
          sub={`${data.companies.inactive} inactivas`}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Usuarios totales"
          value={data.users.total}
          sub={`${data.users.active} activos`}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Usuarios activos"
          value={data.users.active}
          sub={`${data.users.inactive} inactivos`}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
}
