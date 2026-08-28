export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  icon: string | null;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  category?: CategoryRef | null;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}