"use client";
import { useState } from "react";
import { fmtMoney, fmtDelta, deltaColor, levelStyle } from "@/lib/financial-utils";
import { DrillDownModal } from "./drilldown-modal";

interface Column { key: string; label: string; year: number | null; type: "data" | "delta" }
interface Row { _label: string; _level: number; [key: string]: any }

interface Props {
  columns: Column[];
  rows: Row[];
  yearA: number;
  yearB: number;
}

export function PygTable({ columns, rows, yearA, yearB }: Props) {
  const [drillRow, setDrillRow] = useState<Row | null>(null);

  const dataColsA = columns.filter(c => c.type === "data" && c.year === yearA);
  const dataColsB = columns.filter(c => c.type === "data" && c.year === yearB);
  const deltaCols  = columns.filter(c => c.type === "delta");

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10 bg-background border-b">
            <tr>
              <th className="sticky left-0 z-20 bg-background px-3 py-2 text-left min-w-[220px] font-semibold text-muted-foreground">Cuenta</th>
              {/* Year A group */}
              <th colSpan={dataColsA.length} className="px-2 py-1 text-center text-blue-400 border-l border-border font-semibold">{yearA}</th>
              {/* Year B group */}
              <th colSpan={dataColsB.length} className="px-2 py-1 text-center text-teal-400 border-l border-border font-semibold">{yearB}</th>
              {/* Deltas */}
              {deltaCols.length > 0 && (
                <th colSpan={deltaCols.length} className="px-2 py-1 text-center text-muted-foreground border-l border-border font-semibold text-[10px]">Δ%</th>
              )}
            </tr>
            <tr className="border-b bg-muted/30">
              <th className="sticky left-0 z-20 bg-muted/30 px-3 py-1.5 text-left"></th>
              {dataColsA.map(c => (
                <th key={c.key} className="px-2 py-1 text-right text-muted-foreground border-l border-border/50 min-w-[80px]">{c.label}</th>
              ))}
              {dataColsB.map(c => (
                <th key={c.key} className="px-2 py-1 text-right text-muted-foreground border-l border-border/50 min-w-[80px]">{c.label}</th>
              ))}
              {deltaCols.map(c => (
                <th key={c.key} className="px-2 py-1 text-center text-muted-foreground border-l border-border/50 min-w-[60px]">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const style = levelStyle(row._level);
              const clickable = row._level >= 1;
              return (
                <tr
                  key={i}
                  className={`border-b border-border/30 transition-colors hover:bg-muted/20 ${clickable ? "cursor-pointer" : ""} ${style}`}
                  onClick={() => clickable && setDrillRow(row)}
                >
                  <td className={`sticky left-0 px-3 py-1.5 ${style} border-r border-border/30`}>
                    {row._label}
                  </td>
                  {dataColsA.map(c => (
                    <td key={c.key} className="px-2 py-1.5 text-right tabular-nums border-l border-border/20">
                      {fmtMoney(row[c.key])}
                    </td>
                  ))}
                  {dataColsB.map(c => (
                    <td key={c.key} className="px-2 py-1.5 text-right tabular-nums border-l border-border/20">
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
      </div>

      {drillRow && (
        <DrillDownModal
          row={drillRow}
          columns={columns}
          rows={rows}
          onClose={() => setDrillRow(null)}
        />
      )}
    </>
  );
}
