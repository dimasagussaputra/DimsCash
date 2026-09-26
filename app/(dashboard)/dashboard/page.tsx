import { Suspense } from "react";
import {
  getDashboardSummary,
  getCashflowData,
  getCategoryExpenses,
  getRecentTransactions,
} from "@/lib/services/dashboard.service";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import { formatMonthLabel } from "@/lib/utils";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

interface DashboardPageProps {
  searchParams: Promise<{ period?: string; month?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { period, month } = await searchParams;
  const months = period === "12" ? 12 : 6;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth =
    month && MONTH_KEY_PATTERN.test(month) ? month : currentMonth;
  const monthLabel =
    selectedMonth === currentMonth
      ? null
      : formatMonthLabel(
          new Date(
            Number(selectedMonth.slice(0, 4)),
            Number(selectedMonth.slice(5, 7)) - 1,
            1
          )
        );

  return (
    <DashboardContent
      months={months}
      month={selectedMonth}
      currentMonth={currentMonth}
      monthLabel={monthLabel}
    />
  );
}

async function DashboardContent({
  months,
  month,
  currentMonth,
  monthLabel,
}: {
  months: 6 | 12;
  month: string;
  currentMonth: string;
  monthLabel: string | null;
}) {
  const [summary, cashflow, categoryExpenses, recentTransactions] =
    await Promise.all([
      getDashboardSummary(month),
      getCashflowData(months, month),
      getCategoryExpenses(month),
      getRecentTransactions(5, month),
    ]);

  const cashflowTitle = monthLabel
    ? `Arus Kas ${months} Bulan — ${monthLabel}`
    : `Arus Kas ${months} Bulan Terakhir`;
  const expenseTitle = monthLabel
    ? `Pengeluaran ${monthLabel}`
    : "Pengeluaran Bulan Ini";

  return (
    <div className="space-y-6">
      <DashboardGreeting />

      <Suspense>
        <DashboardToolbar defaultMonth={currentMonth} />
      </Suspense>

      <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <BalanceCard
          balance={summary.balance}
          periodIncome={summary.periodIncome}
          periodExpense={summary.periodExpense}
          prevPeriodIncome={summary.prevPeriodIncome}
          prevPeriodExpense={summary.prevPeriodExpense}
          monthLabel={monthLabel}
        />
      </div>

      <div
        className="animate-fade-up grid gap-6 lg:grid-cols-2"
        style={{ animationDelay: "110ms" }}
      >
        <CashflowChart data={cashflow} title={cashflowTitle} />
        <ExpenseChart data={categoryExpenses} title={expenseTitle} />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "170ms" }}>
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
}
