"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
} from "lucide-react";

interface BalanceCardProps {
  balance: number;
  periodIncome: number;
  periodExpense: number;
  prevPeriodIncome: number;
  prevPeriodExpense: number;
}

/**
 * Month-over-month change pill.
 * `invert` flips colour semantics (used for expenses: an increase is bad).
 */
function TrendPill({
  current,
  previous,
  invert = false,
}: {
  current: number;
  previous: number;
  invert?: boolean;
}) {
  if (previous <= 0 || current === previous) return null;

  const changePct = ((current - previous) / previous) * 100;
  const increased = changePct > 0;
  const isGood = invert ? !increased : increased;
  const Icon = increased ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        isGood ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
      )}
    >
      <Icon className="size-3" />
      {Math.abs(Math.round(changePct))}% vs bulan lalu
    </span>
  );
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 900;

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress =
        duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

export function BalanceCard({
  balance,
  periodIncome,
  periodExpense,
  prevPeriodIncome,
  prevPeriodExpense,
}: BalanceCardProps) {
  const animatedBalance = useCountUp(balance);

  const STORAGE_KEY = "dims-cash-balance-visible";

  const [isBalanceVisible, setIsBalanceVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== "false";
    } catch {
      return true;
    }
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(isBalanceVisible));
    }
  }, [isBalanceVisible, isHydrated]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="animate-scale-in relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-950 p-6 text-white shadow-lg shadow-teal-950/20 lg:col-span-3">
        <div className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-teal-100/85">
            <span className="flex size-7 items-center justify-center rounded-lg bg-white/15">
              <Wallet className="size-4" />
            </span>
            <p className="text-sm font-medium">Total Saldo</p>
            <button
              type="button"
              onClick={() => setIsBalanceVisible((v) => !v)}
              aria-label={isBalanceVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
              aria-pressed={isBalanceVisible}
              className="ml-1 flex size-7 items-center justify-center rounded-md text-teal-100/70 transition-colors hover:text-teal-100 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              {isBalanceVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <p className="mt-3 font-mono text-3xl font-bold tracking-tight tabular-nums sm:text-4xl transition-opacity duration-200 ease-in-out" style={{ opacity: isBalanceVisible ? 1 : 0.5 }}>
            {isBalanceVisible ? formatCurrency(animatedBalance) : "Rp ••••••••"}
          </p>
        </div>
      </div>

      <div className="animate-fade-up grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="lift flex flex-col justify-between rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-income/10">
              <TrendingUp className="size-4 text-income" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Masuk bulan ini
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="font-mono text-xl font-bold tabular-nums text-income">
              +{formatCurrency(periodIncome)}
            </p>
            <TrendPill
              current={periodIncome}
              previous={prevPeriodIncome}
            />
          </div>
        </div>

        <div className="lift flex flex-col justify-between rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-expense/10">
              <TrendingDown className="size-4 text-expense" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Keluar bulan ini
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="font-mono text-xl font-bold tabular-nums text-expense">
              -{formatCurrency(periodExpense)}
            </p>
            <TrendPill
              current={periodExpense}
              previous={prevPeriodExpense}
              invert
            />
          </div>
        </div>
      </div>
    </div>
  );
}
