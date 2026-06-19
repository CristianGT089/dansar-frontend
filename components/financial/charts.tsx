"use client";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { fmtMoney } from "@/lib/financial-utils";

const COLORS = { Fruver: "#00bc8c", Cárnicos: "#f85149", PGC: "#58a6ff" };
const YEAR_A = "#58a6ff";
const YEAR_B = "#00bc8c";

const fmtAxis = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

interface TooltipProps { active?: boolean; payload?: any[]; label?: string }

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-2 text-xs shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtMoney(p.value)}</p>
      ))}
    </div>
  );
}

export function SalesTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#8a9198" }} />
        <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: "#8a9198" }} width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="v2024" name="2024" stroke={YEAR_A} strokeDasharray="5 5" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="v2025" name="2025" stroke="#a78bfa" strokeDasharray="3 3" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="v2026" name="2026" stroke={YEAR_B} dot={false} strokeWidth={2.5} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SalesMixChart({ data, year }: { data: any[]; year: number }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="valor" nameKey="categoria" cx="50%" cy="50%"
          innerRadius={60} outerRadius={100} label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
          labelLine={true}
        >
          {data.map((entry: any) => (
            <Cell key={entry.categoria} fill={(COLORS as any)[entry.categoria] ?? "#888"} />
          ))}
        </Pie>
        <Tooltip formatter={(v: any) => fmtMoney(v)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function QuarterlySalesChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
        <XAxis dataKey="trimestre" tick={{ fontSize: 11, fill: "#8a9198" }} />
        <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: "#8a9198" }} width={60} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="v2024" name="2024" fill={YEAR_A} radius={[3, 3, 0, 0]} />
        <Bar dataKey="v2025" name="2025" fill={YEAR_B} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategorySalesChart({ data, lastMonth }: { data: any[]; lastMonth: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: "#8a9198" }} />
        <YAxis type="category" dataKey="categoria" tick={{ fontSize: 11, fill: "#8a9198" }} width={70} />
        <Tooltip formatter={(v: any) => fmtMoney(v)} />
        <Bar dataKey="valor" name={`Ventas YTD (ene–${lastMonth})`} radius={[0, 3, 3, 0]}>
          {data.map((entry: any) => (
            <Cell key={entry.categoria} fill={(COLORS as any)[entry.categoria] ?? "#888"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
