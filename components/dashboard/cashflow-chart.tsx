"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashflowPoint } from "@/types/dashboard";
import { formatCurrency, cn } from "@/lib/utils";

interface CashflowChartProps {
  data: CashflowPoint[];
  months: 6 | 12;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-2 text-sm">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-mono font-medium tabular-nums">
            {formatCurrency(Number(item.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}

export function CashflowChart({ data, months }: CashflowChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">
          Arus Kas {months} Bulan Terakhir
        </CardTitle>
        <div
          role="group"
          aria-label="Pilih periode grafik"
          className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs font-medium"
        >
          {[6, 12].map((m) => (
            <Link
              key={m}
              href={`/dashboard?period=${m}`}
              scroll={false}
              aria-current={m === months ? "true" : undefined}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                m === months
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m} bln
            </Link>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => formatCurrency(v)}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            />
            <Bar
              dataKey="income"
              name="Pemasukan"
              fill="var(--color-income)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill="var(--color-expense)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-2 flex items-center justify-center gap-5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-sm bg-income" />
            Pemasukan
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-sm bg-expense" />
            Pengeluaran
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
