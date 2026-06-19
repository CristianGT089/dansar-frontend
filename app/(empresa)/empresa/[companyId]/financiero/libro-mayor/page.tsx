"use client";
import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { FeatureGuard } from "@/components/layout/feature-guard";
import { useLibroMayor } from "@/lib/queries/financial";
import { fmtMoney } from "@/lib/financial-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function LibroMayorPage({ companyId }: { companyId: string }) {
  const [filters, setFilters] = useState<{ year?: number; month?: number; account?: string; cost_center?: string; page: number }>({ page: 1 });
  const [applied, setApplied] = useState(filters);
  const { data, isLoading } = useLibroMayor(companyId, applied);

  function apply() { setApplied({ ...filters, page: 1 }); }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/empresa/${companyId}/financiero`} className="rounded-md p-1.5 hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Libro Mayor</h1>
          <p className="text-sm text-muted-foreground">Búsqueda de transacciones contables</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Año</Label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={filters.year ?? ""} onChange={e => setFilters(f => ({ ...f, year: e.target.value ? +e.target.value : undefined }))}>
                <option value="">Todos</option>
                {data?.years.map((y: number) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mes</Label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={filters.month ?? ""} onChange={e => setFilters(f => ({ ...f, month: e.target.value ? +e.target.value : undefined }))}>
                <option value="">Todos</option>
                {MESES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cuenta</Label>
              <Input placeholder="Ej: 4135220000" className="text-sm"
                value={filters.account ?? ""} onChange={e => setFilters(f => ({ ...f, account: e.target.value || undefined }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de costo</Label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={filters.cost_center ?? ""} onChange={e => setFilters(f => ({ ...f, cost_center: e.target.value || undefined }))}>
                <option value="">Todos</option>
                {data?.centers.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {data ? `${data.total.toLocaleString()} registros encontrados` : ""}
            </p>
            <Button size="sm" onClick={apply} disabled={isLoading}>
              <Search className="mr-1.5 h-3.5 w-3.5" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {data && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Año","Mes","Cuenta","Título","Debe","Haber","Saldo","Centro Costo"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((r: any, i: number) => (
                <tr key={i} className={`border-b border-border/30 hover:bg-muted/20 ${r.SALDO < 0 ? "text-red-400" : ""}`}>
                  <td className="px-3 py-1.5">{r.ANIO}</td>
                  <td className="px-3 py-1.5">{MESES[r.MES] ?? r.MES}</td>
                  <td className="px-3 py-1.5 font-mono">{r.CUENTA}</td>
                  <td className="px-3 py-1.5 max-w-[200px] truncate">{r.TITULO}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{fmtMoney(r.DEBE)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{fmtMoney(r.HABER)}</td>
                  <td className={`px-3 py-1.5 text-right tabular-nums font-medium ${r.SALDO < 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {fmtMoney(r.SALDO)}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">{r.CENTROCOSTE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {data && data.total > 50 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Página {applied.page} · {data.total} total</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={applied.page <= 1}
              onClick={() => { const p = applied.page - 1; setApplied(f => ({...f, page: p})); setFilters(f => ({...f, page: p})); }}>
              ← Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={applied.page * 50 >= data.total}
              onClick={() => { const p = applied.page + 1; setApplied(f => ({...f, page: p})); setFilters(f => ({...f, page: p})); }}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibroMayorRoute({ params }: { params: { companyId: string } }) {
  return (
    <FeatureGuard companyId={params.companyId} feature="financial_dashboard">
      <LibroMayorPage companyId={params.companyId} />
    </FeatureGuard>
  );
}
