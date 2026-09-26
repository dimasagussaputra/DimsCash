"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CashflowPoint } from "@/types/dashboard";
import { formatCompactCurrency } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

interface CashflowChartProps {
  data: CashflowPoint[];
  title: string;
}

const CHART_HEIGHT = 300;
const Y_AXIS_WIDTH = 56;
const X_AXIS_HEIGHT = 30;
const CHART_MARGIN = { top: 16, right: 26, bottom: 6, left: 4 };
const PLOT_TOP = CHART_MARGIN.top;
const PLOT_BOTTOM = CHART_HEIGHT - CHART_MARGIN.bottom - X_AXIS_HEIGHT;
const PLOT_LEFT = CHART_MARGIN.left + Y_AXIS_WIDTH;
const LABEL_GAP = 9;
const LABEL_DROP = 14;
const LABEL_SLOT = 38;
const LABEL_EDGE = 20;
const LABEL_MIN_GAP = 10;
const DOMAIN_TOP_PAD = 1.2;
const TICK_COUNT = 5;
const NICE_STEPS = [1, 2, 2.5, 5, 10];

function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  for (const step of NICE_STEPS) {
    const candidate = step * base;
    if (candidate >= value) return candidate;
  }
  return 10 * base;
}

interface CashflowDotProps {
  cx?: number;
  cy?: number;
  index: number;
  value: unknown;
  payload: unknown;
}

export function CashflowChart({ data, title }: CashflowChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setChartWidth(rect.width);
    });
    observer.observe(el);
    setChartWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const { domainMin, domainMax, ticks } = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const point of data) {
      min = Math.min(min, point.income, point.expense);
      max = Math.max(max, point.income, point.expense);
    }
    if (!Number.isFinite(min)) {
      return { domainMin: 0, domainMax: 1, ticks: [0, 1] };
    }
    const step = niceCeil((Math.max(max, 1) * DOMAIN_TOP_PAD) / TICK_COUNT);
    const domainMax = step * Math.max(1, Math.ceil((max * DOMAIN_TOP_PAD) / step));
    const domainMin = min > 0 ? step * Math.floor(min / step) : 0;
    const count = Math.round((domainMax - domainMin) / step);
    const ticks: number[] = [];
    for (let i = 0; i <= count; i += 1) ticks.push(domainMin + i * step);
    return { domainMin, domainMax, ticks };
  }, [data]);

  const { labeledIndexes, plotRight } = useMemo(() => {
    const right = Math.max(chartWidth - CHART_MARGIN.right, PLOT_LEFT);
    const spacing =
      data.length > 1 ? (right - PLOT_LEFT) / (data.length - 1) : 0;
    const step =
      spacing > 0 && chartWidth > 0
        ? Math.max(1, Math.ceil(LABEL_SLOT / spacing))
        : 0;
    const labeled = new Set<number>();
    if (step > 0) {
      for (let i = 0; i < data.length; i += step) labeled.add(i);
      const last = data.length - 1;
      if (last >= 0 && !labeled.has(last)) {
        let previous = -1;
        labeled.forEach((i) => {
          if (i > previous) previous = i;
        });
        if ((last - previous) * spacing >= LABEL_SLOT) {
          labeled.add(last);
        } else if (previous > 0) {
          labeled.delete(previous);
          labeled.add(last);
        }
      }
    }
    return { labeledIndexes: labeled, plotRight: right };
  }, [chartWidth, data.length]);

  const cyFor = (value: number) => {
    const range = domainMax - domainMin || 1;
    return (
      PLOT_BOTTOM -
      ((value - domainMin) / range) * (PLOT_BOTTOM - PLOT_TOP)
    );
  };

  const labelYFor = (
    series: "income" | "expense",
    value: number,
    other: number,
    cy: number
  ) => {
    const isUpper = series === "income" ? value >= other : value > other;
    let y = isUpper ? cy - LABEL_GAP : cy + LABEL_DROP;
    if (isUpper && y < PLOT_TOP + 8) y = cy + LABEL_DROP;
    if (!isUpper && y > PLOT_BOTTOM - 4) y = cy - LABEL_GAP;
    return y;
  };

  const createDot = (color: string, series: "income" | "expense") => {
    return function PointDot(props: CashflowDotProps): ReactNode {
      const { cx, cy, index, payload } = props;
      if (typeof cx !== "number" || typeof cy !== "number") return null;

      const value = Number(props.value ?? 0);
      const point = payload as CashflowPoint | undefined;
      const showLabel = labeledIndexes.has(index) && Number.isFinite(value);
      const anchor =
        cx < PLOT_LEFT + LABEL_EDGE
          ? "start"
          : cx > plotRight - LABEL_EDGE
            ? "end"
            : "middle";

      let label: ReactNode = null;
      if (showLabel) {
        const incomeValue = Number(point?.income ?? value);
        const expenseValue = Number(point?.expense ?? value);
        const incomeY = labelYFor(
          "income",
          incomeValue,
          expenseValue,
          cyFor(incomeValue)
        );
        const expenseY = labelYFor(
          "expense",
          expenseValue,
          incomeValue,
          cyFor(expenseValue)
        );
        const blocked =
          series === "expense" &&
          Math.abs(expenseY - incomeY) < LABEL_MIN_GAP;
        if (!blocked) {
          const other =
            series === "income" ? expenseValue : incomeValue;
          const labelY = labelYFor(series, value, other, cy);
          label = (
            <text
              x={cx}
              y={labelY}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={500}
              fill={color}
            >
              {formatCompactCurrency(value)}
            </text>
          );
        }
      }

      return (
        <g>
          <circle cx={cx} cy={cy} r={3} fill={color} stroke="none" />
          {label}
        </g>
      );
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={wrapRef}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-income)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
                axisLine={false}
                tickLine={false}
                width={Y_AXIS_WIDTH}
                domain={[domainMin, domainMax]}
                ticks={ticks}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Pemasukan"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={createDot("var(--color-income)", "income")}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Pengeluaran"
                stroke="var(--color-expense)"
                strokeWidth={2}
                dot={createDot("var(--color-expense)", "expense")}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

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
