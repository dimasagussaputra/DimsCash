"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn, formatMonthLabel } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTH_OPTION_COUNT = 12;
const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const PERIODS = [6, 12] as const;

function dateFromKey(key: string): Date {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function keyFromDate(date: Date): string {
  const month = date.getMonth() + 1;
  return `${date.getFullYear()}-${String(month).padStart(2, "0")}`;
}

interface DashboardToolbarProps {
  defaultMonth: string;
}

export function DashboardToolbar({ defaultMonth }: DashboardToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawMonth = searchParams.get("month");
  const activeMonth =
    rawMonth && MONTH_KEY_PATTERN.test(rawMonth) ? rawMonth : defaultMonth;
  const activePeriod = searchParams.get("period") === "12" ? 12 : 6;

  const options = Array.from({ length: MONTH_OPTION_COUNT }, (_, i) => {
    const date = dateFromKey(defaultMonth);
    date.setMonth(date.getMonth() - i);
    return keyFromDate(date);
  }).reverse();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/dashboard?${next.toString()}`, { scroll: false });
  }

  const items = Object.fromEntries(
    options.map((key) => [key, formatMonthLabel(dateFromKey(key), true)])
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Select
        value={activeMonth}
        onValueChange={(value) =>
          setParam("month", value === defaultMonth ? null : value)
        }
        items={items}
      >
        <SelectTrigger className="w-[176px]" aria-label="Pilih bulan">
          <SelectValue>
            {formatMonthLabel(dateFromKey(activeMonth), true)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((key) => (
            <SelectItem key={key} value={key}>
              {formatMonthLabel(dateFromKey(key), true)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div
        role="group"
        aria-label="Pilih periode grafik"
        className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs font-medium"
      >
        {PERIODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setParam("period", m === 6 ? null : String(m))}
            aria-pressed={activePeriod === m}
            className={cn(
              "rounded-md px-2.5 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              activePeriod === m
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m} bln
          </button>
        ))}
      </div>
    </div>
  );
}
