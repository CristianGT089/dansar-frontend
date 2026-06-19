"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { fmtMoney, deltaColor, fmtDelta } from "@/lib/financial-utils";

interface Column { key: string; label: string; year: number | null; type: "data" | "delta" }
interface Row { _label: string; _level: number; [key: string]: any }

interface Props {
  row: Row;
  columns: Column[];
  rows: Row[];
  onClose: () => void;
}

export function DrillDownModal({ row, columns, rows, onClose }: Props) {
  const dataColumns = columns.filter(c => c.type === "data");

  // Find all leaf descendants of this row
  const idx = rows.indexOf(row);
  const children: Row[] = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (r._level <= row._level && row._level >= 0) break;
    if (r._level > row._level) children.push(r);
  }
  const leaves = children.filter(r => r._level === Math.max(...children.map(c => c._level)));

  const [selected, setSelected] = useState<Set<number>>(new Set(leaves.map((_, i) => i)));
  const [hideZero, setHideZero] = useState(false);

  const visible = hideZero
    ? leaves.filter(r => dataColumns.some(c => r[c.key] && r[c.key] !== 0))
    : leaves;

  const toggleAll = () => {
    if (selected.size === visible.length) setSelected(new Set());
    else setSelected(new Set(visible.map((_, i) => i)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border bg-card shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <p className="font-semibold">{row._label}</p>
            <p className="text-xs text-muted-foreground">{leaves.length} cuentas detalle</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)} />
              Ocultar ceros
            </label>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" checked={selected.size === visible.length} onChange={toggleAll} />
                </th>
                <th className="px-3 py-2 text-left text-muted-foreground">Cuenta</th>
                {dataColumns.map(c => (
                  <th key={c.key} className="px-2 py-2 text-right text-muted-foreground min-w-[80px]">
                    <span className={c.year ? (c.year === dataColumns[0].year ? "text-blue-400" : "text-teal-400") : ""}>
                      {c.year} {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <tr key={i} className={`border-b border-border/20 hover:bg-muted/20 ${selected.has(i) ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => {
                        const s = new Set(selected);
                        s.has(i) ? s.delete(i) : s.add(i);
                        setSelected(s);
                      }}
                    />
                  </td>
                  <td className="px-3 py-1.5">{r._label}</td>
                  {dataColumns.map(c => (
                    <td key={c.key} className="px-2 py-1.5 text-right tabular-nums">{fmtMoney(r[c.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border sticky bottom-0 bg-card">
              <tr className="text-emerald-400 font-semibold">
                <td colSpan={2} className="px-3 py-2">Subtotal seleccionados</td>
                {dataColumns.map(c => (
                  <td key={c.key} className="px-2 py-2 text-right tabular-nums">
                    {fmtMoney(visible.filter((_, i) => selected.has(i)).reduce((s, r) => s + (r[c.key] ?? 0), 0))}
                  </td>
                ))}
              </tr>
              <tr className="text-foreground font-bold">
                <td colSpan={2} className="px-3 py-2">Total {row._label}</td>
                {dataColumns.map(c => (
                  <td key={c.key} className="px-2 py-2 text-right tabular-nums">
                    {fmtMoney(row[c.key])}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
