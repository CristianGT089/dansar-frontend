"use client";
import { useState } from "react";
import { fmtMoney, fmtDelta, deltaColor, levelTextStyle, levelRowBg } from "@/lib/financial-utils";
import { DrillDownModal } from "./drilldown-modal";

interface Column { key: string; label: string; year: number | null; type: "data" | "delta" }
interface Row { _label: string; _level: number; [key: string]: any }
interface Props { columns: Column[]; rows: Row[]; yearA: number; yearB: number }

/**
 * Retorna el color CSS sólido del fondo de la fila para usarlo como
 * background-color inline en el sticky <td>, garantizando opacidad total.
 */
function stickyBgStyle(level: number): React.CSSProperties {
  // Valores sólidos que visualmente equivalen a las clases semi-transparentes
  // sobre el fondo de card (dark: #14161F, light: #fff)
  if (level === -1) return { backgroundColor: "rgb(5 46 22)"  }; // emerald-950 sólido
  if (level === 0)  return { backgroundColor: "hsl(var(--muted) / 1)" };
  return { backgroundColor: "hsl(var(--card))" };
}

export function PygTable({ columns, rows, yearA, yearB }: Props) {
  const [drillRow, setDrillRow] = useState<Row | null>(null);

  const dataColsA = columns.filter(c => c.type === "data" && c.year === yearA);
  const dataColsB = columns.filter(c => c.type === "data" && c.year === yearB);
  const deltaCols  = columns.filter(c => c.type === "delta");

  return (
    <>
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10">
          {/* Year group headers */}
          <tr className="border-b border-border/60" style={{ backgroundColor: "hsl(var(--card))" }}>
            <th className="sticky left-0 z-20 px-4 py-2.5 text-left min-w-[220px] text-muted-foreground font-medium"
                style={{ backgroundColor: "hsl(var(--card))" }}>
              Cuenta
            </th>
            <th colSpan={dataColsA.length} className="px-2 py-2 text-center text-[11px] font-semibold text-primary/80 border-l border-border/40">
              {yearA}
            </th>
            <th colSpan={dataColsB.length} className="px-2 py-2 text-center text-[11px] font-semibold text-teal-400/90 border-l border-border/40">
              {yearB}
            </th>
            {deltaCols.length > 0 && (
              <th colSpan={deltaCols.length} className="px-2 py-2 text-center text-[10px] font-medium text-muted-foreground/60 border-l border-border/40">
                Δ vs {yearA}
              </th>
            )}
          </tr>
          {/* Column sub-headers */}
          <tr className="border-b border-border/60" style={{ backgroundColor: "hsl(var(--muted))" }}>
            <th className="sticky left-0 z-20 px-4 py-1.5 text-left"
                style={{ backgroundColor: "hsl(var(--muted))" }} />
            {dataColsA.map(c => (
              <th key={c.key} className="px-2 py-1.5 text-right text-[10px] font-medium text-muted-foreground/70 border-l border-border/30 min-w-[80px]">
                {c.label}
              </th>
            ))}
            {dataColsB.map(c => (
              <th key={c.key} className="px-2 py-1.5 text-right text-[10px] font-medium text-muted-foreground/70 border-l border-border/30 min-w-[80px]">
                {c.label}
              </th>
            ))}
            {deltaCols.map(c => (
              <th key={c.key} className="px-2 py-1.5 text-center text-[10px] font-medium text-muted-foreground/70 border-l border-border/30 min-w-[60px]">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const textStyle = levelTextStyle(row._level);
            const rowBg = levelRowBg(row._level);
            const clickable = row._level >= 1;
            const indent = row._level === 2 ? "pl-7" : row._level >= 3 ? "pl-11" : "px-4";

            return (
              <tr
                key={i}
                onClick={() => clickable && setDrillRow(row)}
                className={`border-b transition-colors hover:bg-primary/5 ${rowBg} ${clickable ? "cursor-pointer" : ""} ${row._level <= 0 ? "border-border/50" : "border-border/20"}`}
              >
                {/* Sticky label cell — fondo siempre sólido */}
                <td
                  className={`sticky left-0 z-10 ${indent} py-1.5 border-r border-border/20 ${textStyle}`}
                  style={stickyBgStyle(row._level)}
                >
                  {clickable && (
                    <span className="mr-1 text-[10px] opacity-25">↗</span>
                  )}
                  {row._label}
                </td>

                {dataColsA.map(c => (
                  <td key={c.key} className={`px-2 py-1.5 text-right tabular-nums border-l border-border/20 ${textStyle}`}>
                    {fmtMoney(row[c.key])}
                  </td>
                ))}
                {dataColsB.map(c => (
                  <td key={c.key} className={`px-2 py-1.5 text-right tabular-nums border-l border-border/20 ${textStyle}`}>
                    {fmtMoney(row[c.key])}
                  </td>
                ))}
                {deltaCols.map(c => (
                  <td key={c.key} className={`px-2 py-1.5 text-center tabular-nums border-l border-border/20 ${deltaColor(row[c.key])}`}>
                    {fmtDelta(row[c.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {drillRow && (
        <DrillDownModal row={drillRow} columns={columns} rows={rows} onClose={() => setDrillRow(null)} />
      )}
    </>
  );
}
