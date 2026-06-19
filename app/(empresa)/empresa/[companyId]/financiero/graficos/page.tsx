"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FeatureGuard } from "@/components/layout/feature-guard";
import { useSalesTrend, useSalesMix, useQuarterlySales, useCategorySales } from "@/lib/queries/financial";
import { SalesTrendChart, SalesMixChart, QuarterlySalesChart, CategorySalesChart } from "@/components/financial/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function GraficosPage({ companyId }: { companyId: string }) {
  const { data: trend } = useSalesTrend(companyId);
  const { data: mix2024 } = useSalesMix(companyId, 2024);
  const { data: quarterly } = useQuarterlySales(companyId);
  const { data: catSales } = useCategorySales(companyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/empresa/${companyId}/financiero`} className="rounded-md p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Gráficos</h1>
          <p className="text-sm text-muted-foreground">Análisis visual de ventas</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {trend && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tendencia de Ventas — 2024 vs 2025 vs 2026</CardTitle>
            </CardHeader>
            <CardContent><SalesTrendChart data={trend} /></CardContent>
          </Card>
        )}

        {mix2024 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mix de Ventas 2024</CardTitle>
            </CardHeader>
            <CardContent><SalesMixChart data={mix2024} year={2024} /></CardContent>
          </Card>
        )}

        {quarterly && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ventas por Trimestre — 2024 vs 2025</CardTitle>
            </CardHeader>
            <CardContent><QuarterlySalesChart data={quarterly} /></CardContent>
          </Card>
        )}

        {catSales && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas 2026 por Categoría (ene–{catSales.last_month})
              </CardTitle>
            </CardHeader>
            <CardContent><CategorySalesChart data={catSales.data} lastMonth={catSales.last_month} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function GraficosRoute({ params }: { params: { companyId: string } }) {
  return (
    <FeatureGuard companyId={params.companyId} feature="financial_dashboard">
      <GraficosPage companyId={params.companyId} />
    </FeatureGuard>
  );
}
