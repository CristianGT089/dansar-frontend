"use client";
import { useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, TrendingUp } from "lucide-react";
import { FeatureGuard } from "@/components/layout/feature-guard";
import { useCompanyStore } from "@/lib/stores/company";
import { usePygMensual, usePygTrimestral, useSalesTrend } from "@/lib/queries/financial";
import { KpiStrip } from "@/components/financial/kpi-strip";
import { PygTable } from "@/components/financial/pyg-table";
import { SalesTrendChart } from "@/components/financial/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FinancialDashboard({ companyId }: { companyId: string }) {
  const [pygTab, setPygTab] = useState<"mensual" | "trimestral">("mensual");
  const { data: pygM, isLoading: loadingM } = usePygMensual(companyId);
  const { data: pygT, isLoading: loadingT } = usePygTrimestral(companyId);
  const { data: trend } = useSalesTrend(companyId);
  const { activeCompany } = useCompanyStore();

  const pyg = pygTab === "mensual" ? pygM : pygT;
  const loading = pygTab === "mensual" ? loadingM : loadingT;

  function getKpi(data: any, year: number, col: string) {
    if (!data) return { label: String(year), ingresos: 0, utilidad_bruta: 0, margen_bruto: 0 };
    const ing = data.rows.find((r: any) => r._label === "INGRESOS OPERACIONALES")?.[col] ?? 0;
    const ub  = data.rows.find((r: any) => r._label === "UTILIDAD BRUTA")?.[col] ?? 0;
    return { label: String(year), ingresos: ing, utilidad_bruta: ub, margen_bruto: ing ? Math.round(ub / ing * 1000) / 10 : 0 };
  }

  const kpiA = pygM ? getKpi(pygM, pygM.year_a, `${pygM.year_a}_M06`) : null;
  const kpiB = pygM ? getKpi(pygM, pygM.year_b, `${pygM.year_b}_M06`) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Financiero</h1>
          <p className="text-sm text-muted-foreground">{activeCompany?.name} · Análisis contable</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/empresa/${companyId}/financiero/graficos`}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
            <BarChart3 className="h-3.5 w-3.5" /> Gráficos
          </Link>
          <Link href={`/empresa/${companyId}/financiero/libro-mayor`}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
            <BookOpen className="h-3.5 w-3.5" /> Libro Mayor
          </Link>
        </div>
      </div>

      {kpiA && kpiB && <KpiStrip yearA={kpiA} yearB={kpiB} />}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Estado de Resultados</CardTitle>
            <div className="flex gap-1 rounded-lg border p-0.5 text-xs">
              {(["mensual", "trimestral"] as const).map(t => (
                <button key={t} onClick={() => setPygTab(t)}
                  className={`rounded-md px-3 py-1 capitalize transition-colors ${pygTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Cargando datos...</div>
          ) : pyg ? (
            <PygTable columns={pyg.columns} rows={pyg.rows} yearA={pyg.year_a} yearB={pyg.year_b} />
          ) : null}
        </CardContent>
      </Card>

      {trend && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-500" /> Tendencia de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={trend} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FinancieroPage({ params }: { params: { companyId: string } }) {
  return (
    <FeatureGuard companyId={params.companyId} feature="financial_dashboard">
      <FinancialDashboard companyId={params.companyId} />
    </FeatureGuard>
  );
}
