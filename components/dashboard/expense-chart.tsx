"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryExpense } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

interface ExpenseChartProps {
  data: CategoryExpense[];
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Food & Beverage": "var(--chart-food)",
  "Transportation": "var(--chart-transport)",
  "Shopping": "var(--chart-shopping)",
  "Education": "var(--chart-education)",
  "Health": "var(--chart-health)",
  "Entertainment": "var(--chart-entertain)",
  "Bills": "var(--chart-bills)",
  "Other": "var(--chart-other)",
};

const FALLBACK_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
  "var(--color-chart-9)",
  "var(--color-chart-10)",
  "var(--color-chart-11)",
  "var(--color-chart-12)",
];

const getCategoryColor = (name: string, index: number) =>
  CATEGORY_COLOR_MAP[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground">
        {payload[0].name}
      </p>
      <p className="font-mono text-sm font-medium tabular-nums">
        {formatCurrency(Number(payload[0].value ?? 0))}
      </p>
    </div>
  );
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengeluaran Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Belum ada data pengeluaran
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pengeluaran Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={3}
                cornerRadius={6}
                dataKey="total"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={getCategoryColor(entry.name, index)} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-mono text-lg font-bold tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {data.map((d, index) => (
            <li
              key={d.name}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getCategoryColor(d.name, index) }}
                />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                {Math.round((d.total / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
