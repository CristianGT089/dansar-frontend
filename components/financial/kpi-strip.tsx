"use client";
import { fmtMoney, fmtDelta, deltaColor } from "@/lib/financial-utils";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface KpiData { label: string; ingresos: number; utilidad_bruta: number; margen_bruto: number }
interface Props { yearA: KpiData; yearB: KpiData }

function KpiCard({
  title, value, sub, accentClass, icon: Icon,
}: {
  title: string; value: string; sub?: React.ReactNode; accentClass: string; icon: React.ElementType;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-4 transition-shadow hover:shadow-md hover:shadow-black/5">
      <div className={`absolute left-0 top-0 h-full w-[3px] rounded-l-lg ${accentClass}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <div className="mt-1 flex items-center gap-1 text-xs">{sub}</div>}
        </div>
        <div className="mt-0.5 rounded-md bg-muted/60 p-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function KpiStrip({ yearA, yearB }: Props) {
  const deltaIngresos = yearA.ingresos
    ? ((yearB.ingresos - yearA.ingresos) / Math.abs(yearA.ingresos)) * 100
    : null;
  const deltaMargen = yearB.margen_bruto - yearA.margen_bruto;
  const isUp = (deltaIngresos ?? 0) >= 0;

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title={`Ingresos ${yearA.label}`}
        value={fmtMoney(yearA.ingresos)}
        accentClass="bg-primary"
        icon={DollarSign}
      />
      <KpiCard
        title={`Ingresos ${yearB.label}`}
        value={fmtMoney(yearB.ingresos)}
        sub={
          deltaIngresos != null && (
            <span className={`flex items-center gap-0.5 ${deltaColor(deltaIngresos)}`}>
              {isUp
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {fmtDelta(deltaIngresos)} vs {yearA.label}
            </span>
          )
        }
        accentClass="bg-teal-500"
        icon={DollarSign}
      />
      <KpiCard
        title={`Utilidad Bruta ${yearB.label}`}
        value={fmtMoney(yearB.utilidad_bruta)}
        accentClass="bg-violet-500"
        icon={TrendingUp}
      />
      <KpiCard
        title={`Margen Bruto ${yearB.label}`}
        value={`${yearB.margen_bruto.toFixed(1)}%`}
        sub={
          <span className={deltaColor(deltaMargen)}>
            {fmtDelta(deltaMargen)} vs {yearA.label}
          </span>
        }
        accentClass="bg-violet-500"
        icon={Percent}
      />
    </div>
  );
}
