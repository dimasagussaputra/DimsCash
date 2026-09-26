import { createClient } from "@/lib/supabase/server";
import { toError, withRetry } from "@/lib/supabase/errors";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { DashboardSummary, CashflowPoint, CategoryExpense } from "@/types/dashboard";

function monthDate(month: string): Date {
  const [year, m] = month.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(m) || m < 1 || m > 12) {
    return new Date();
  }
  return new Date(year, m - 1, 1);
}

export async function getDashboardSummary(month: string): Promise<DashboardSummary> {
  const supabase = await createClient();
  const endMonth = monthDate(month);
  const currentKey = format(endMonth, "yyyy-MM");
  const prevKey = format(subMonths(endMonth, 1), "yyyy-MM");

  // Single lightweight query — all metrics are aggregated from these rows.
  const { data, error } = await withRetry(() =>
    supabase.from("transactions").select("type, amount, transaction_date")
  );

  if (error) throw toError(error);

  let totalIncome = 0;
  let totalExpense = 0;
  let periodIncome = 0;
  let periodExpense = 0;
  let prevPeriodIncome = 0;
  let prevPeriodExpense = 0;

  for (const t of data ?? []) {
    const amt = Number(t.amount);
    if (t.type === "income") {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }

    const key = t.transaction_date.slice(0, 7); // "YYYY-MM"
    if (key === currentKey) {
      if (t.type === "income") periodIncome += amt;
      else periodExpense += amt;
    } else if (key === prevKey) {
      if (t.type === "income") prevPeriodIncome += amt;
      else prevPeriodExpense += amt;
    }
  }

  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    periodIncome,
    periodExpense,
    prevPeriodIncome,
    prevPeriodExpense,
  };
}

/**
 * Monthly income vs expense for the last `months` months (6 or 12).
 * One range query instead of one query per month.
 */
export async function getCashflowData(months: 6 | 12, month: string): Promise<CashflowPoint[]> {
  const supabase = await createClient();
  const endMonth = monthDate(month);
  const start = format(startOfMonth(subMonths(endMonth, months - 1)), "yyyy-MM-dd");
  const end = format(endOfMonth(endMonth), "yyyy-MM-dd");

  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .select("type, amount, transaction_date")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
  );

  if (error) throw toError(error);

  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    keys.push(format(subMonths(endMonth, i), "yyyy-MM"));
  }
  const buckets = new Map(
    keys.map((k) => [k, { income: 0, expense: 0 }])
  );

  for (const t of data ?? []) {
    const bucket = buckets.get(t.transaction_date.slice(0, 7));
    if (!bucket) continue;
    if (t.type === "income") bucket.income += Number(t.amount);
    else bucket.expense += Number(t.amount);
  }

  return keys.map((key) => {
    const bucket = buckets.get(key)!;
    return {
      label: format(new Date(`${key}-01T00:00:00`), "MMM"),
      income: bucket.income,
      expense: bucket.expense,
    };
  });
}

export async function getCategoryExpenses(month: string): Promise<CategoryExpense[]> {
  const supabase = await createClient();
  const endMonth = monthDate(month);
  const monthStart = format(startOfMonth(endMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(endMonth), "yyyy-MM-dd");

  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .select("category_id, amount, category:categories(name, icon)")
      .eq("type", "expense")
      .gte("transaction_date", monthStart)
      .lte("transaction_date", monthEnd)
  );

  if (error) throw toError(error);

  const map = new Map<string, CategoryExpense>();

  for (const t of data ?? []) {
    const cat = t.category as unknown as { name: string; icon: string | null } | null;
    if (!cat) continue;
    const existing = map.get(t.category_id);
    if (existing) {
      existing.total += Number(t.amount);
    } else {
      map.set(t.category_id, {
        categoryId: t.category_id,
        name: cat.name,
        icon: cat.icon,
        total: Number(t.amount),
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export async function getRecentTransactions(limit: number, month: string) {
  const supabase = await createClient();
  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .select("*, category:categories(id, name, icon, type)")
      .lte("transaction_date", format(endOfMonth(monthDate(month)), "yyyy-MM-dd"))
      .order("transaction_date", { ascending: false })
      .limit(limit)
  );

  if (error) throw toError(error);
  return data ?? [];
}
