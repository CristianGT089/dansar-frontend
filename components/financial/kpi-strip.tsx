"use client";
import { fmtMoney, fmtDelta, deltaColor } from "@/lib/financial-utils";

interface KpiData {
  label: string;
  ingresos: number;
  utilidad_bruta: number;
  margen_bruto: number;
}

interface Props {
  yearA: KpiData;
  yearB: KpiData;
}

function KpiCard({ title, valueA, valueB, isMoney = true, accent }: {
  title: string; valueA: number; valueB: number; isMoney?: boolean; accent: string;
}) {
  const delta = valueA !== 0 ? ((valueB - valueA) / Math.abs(valueA)) * 100 : null;
  const fmt = isMoney ? fmtMoney : (v: number) => `${v.toFixed(1)}%`;

  return (
    <div className={`rounded-lg border-l-4 bg-card p-4 ${accent}`}>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-xl font-bold">{fmt(valueB)}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{fmt(valueA)}</span>
        {delta != null && (
          <span className={deltaColor(delta)}>{fmtDelta(delta)}</span>
        )}
      </div>
    </div>
  );
}

export function KpiStrip({ yearA, yearB }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard title={`Ingresos ${yearA.label}`} valueA={yearA.ingresos} valueB={yearA.ingresos} accent="border-blue-500" />
      <KpiCard title={`Ingresos ${yearB.label}`} valueA={yearA.ingresos} valueB={yearB.ingresos} accent="border-teal-500" />
      <KpiCard title="Utilidad Bruta" valueA={yearA.utilidad_bruta} valueB={yearB.utilidad_bruta} accent="border-emerald-500" />
      <KpiCard title="Margen Bruto" valueA={yearA.margen_bruto} valueB={yearB.margen_bruto} isMoney={false} accent="border-purple-500" />
    </div>
  );
}
