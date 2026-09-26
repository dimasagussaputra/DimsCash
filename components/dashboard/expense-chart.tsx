"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryExpense } from "@/types/dashboard";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";

interface ExpenseChartProps {
  data: CategoryExpense[];
  title: string;
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

const SLICE_LABEL_SIZE = 10;
const MIN_SLICE_LABEL_SHARE = 0.05;
const SLICE_LABEL_GAP = 8;

const getCategoryColor = (name: string, index: number) =>
  CATEGORY_COLOR_MAP[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];

const estimateTextWidth = (text: string) =>
  text.length * SLICE_LABEL_SIZE * 0.58;

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

export function ExpenseChart({ data, title }: ExpenseChartProps) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  const renderSliceLabel = (props: PieLabelRenderProps) => {
    const value = Number(props.value ?? 0);
    const share = props.percent ?? (total > 0 ? value / total : 0);
    if (share < MIN_SLICE_LABEL_SHARE) return null;

    const radius = (props.innerRadius + props.outerRadius) / 2;
    const angle = (-(props.startAngle + props.endAngle) / 2) * (Math.PI / 180);
    const x = props.cx + Math.cos(angle) * radius;
    const y = props.cy + Math.sin(angle) * radius;

    const text = formatCompactCurrency(value);
    const width = estimateTextWidth(text);
    const available = share * Math.PI * 2 * radius - SLICE_LABEL_GAP;
    if (width > available) return null;

    const half = width / 2;
    const near = Math.hypot(props.cx - (x - half), props.cy - y);
    const far = Math.hypot(props.cx - (x + half), props.cy - y);
    const innerLimit = props.innerRadius + 3;
    const outerLimit = props.outerRadius - 3;
    if (
      near < innerLimit ||
      far < innerLimit ||
      near > outerLimit ||
      far > outerLimit
    ) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={SLICE_LABEL_SIZE}
        fontWeight={600}
        fill="#fff"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1.5}
        paintOrder="stroke"
      >
        {text}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
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
        <CardTitle className="text-base">{title}</CardTitle>
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
                label={renderSliceLabel}
                labelLine={false}
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
              <span className="flex shrink-0 items-center gap-2 font-mono tabular-nums">
                <span className="font-medium">
                  {formatCurrency(d.total)}
                </span>
                <span className="w-9 text-right text-muted-foreground">
                  {Math.round((d.total / total) * 100)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
