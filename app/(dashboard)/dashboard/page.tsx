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

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { period } = await searchParams;
  const months = period === "12" ? 12 : 6;

  return <DashboardContent months={months} />;
}

async function DashboardContent({ months }: { months: 6 | 12 }) {
  const [summary, cashflow, categoryExpenses, recentTransactions] =
    await Promise.all([
      getDashboardSummary(),
      getCashflowData(months),
      getCategoryExpenses(),
      getRecentTransactions(5),
    ]);

  return (
    <div className="space-y-6">
      <DashboardGreeting />

      <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <BalanceCard
          balance={summary.balance}
          periodIncome={summary.periodIncome}
          periodExpense={summary.periodExpense}
          prevPeriodIncome={summary.prevPeriodIncome}
          prevPeriodExpense={summary.prevPeriodExpense}
        />
      </div>

      <div
        className="animate-fade-up grid gap-6 lg:grid-cols-2"
        style={{ animationDelay: "110ms" }}
      >
        <CashflowChart data={cashflow} months={months} />
        <ExpenseChart data={categoryExpenses} />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "170ms" }}>
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
}
