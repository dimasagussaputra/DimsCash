export interface DashboardSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  periodIncome: number;
  periodExpense: number;
  prevPeriodIncome: number;
  prevPeriodExpense: number;
}

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryExpense {
  categoryId: string;
  name: string;
  icon: string | null;
  total: number;
}