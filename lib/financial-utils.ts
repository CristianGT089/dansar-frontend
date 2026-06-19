export function fmtMoney(v: number | null | undefined): string {
  if (v == null || v === 0) return "—";
  const m = Math.abs(v) / 1_000_000;
  const s = v < 0 ? "-" : "";
  if (m >= 1) return `${s}$${m.toFixed(1)}M`;
  return `${s}$${(Math.abs(v) / 1000).toFixed(0)}K`;
}

export function fmtDelta(v: number | null | undefined): string {
  if (v == null) return "—";
  const arrow = v >= 0 ? "▲" : "▼";
  return `${arrow} ${Math.abs(v).toFixed(1)}%`;
}

export function deltaColor(v: number | null | undefined): string {
  if (v == null) return "text-muted-foreground";
  return v >= 0 ? "text-emerald-500" : "text-red-500";
}

export function levelStyle(level: number): string {
  if (level === -1) return "bg-emerald-950/40 text-emerald-400 font-bold";
  if (level === 0)  return "bg-muted/40 font-bold text-foreground";
  if (level === 1)  return "text-blue-400 font-semibold";
  if (level === 2)  return "text-muted-foreground pl-4";
  return "text-muted-foreground/70 text-xs pl-8";
}
