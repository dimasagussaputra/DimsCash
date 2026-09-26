import { createClient } from "@/lib/supabase/server";
import { toError, withRetry } from "@/lib/supabase/errors";
import type { Transaction, TransactionFilters } from "@/types/transaction";

export const TRANSACTIONS_PAGE_SIZE = 10;

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedTransactions> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*, category:categories(id, name, icon, type)", {
      count: "exact",
    });

  if (filters.search) {
    const sanitized = filters.search.replace(/[%_]/g, "\\$&");
    query = query.ilike("description", `%${sanitized}%`);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.from) {
    query = query.gte("transaction_date", filters.from);
  }
  if (filters.to) {
    query = query.lte("transaction_date", filters.to);
  }

  const sort = filters.sort ?? "desc";
  // Secondary key keeps pagination stable when dates are equal.
  query = query.order("transaction_date", { ascending: sort === "asc" });
  query = query.order("created_at", { ascending: sort === "asc" });

  const limit = filters.limit ?? TRANSACTIONS_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await withRetry(() => query);
  if (error) throw toError(error);

  const total = count ?? 0;

  return {
    data: data ?? [],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .select("*, category:categories(id, name, icon, type)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
  );

  if (error) throw toError(error);
  return data;
}

export async function createTransaction(payload: {
  type: "income" | "expense";
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}): Promise<Transaction> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .insert({ ...payload, user_id: user.id })
      .select("*, category:categories(id, name, icon, type)")
      .single()
  );

  if (error) throw toError(error);
  return data;
}

export async function updateTransaction(
  id: string,
  payload: {
    type: "income" | "expense";
    category_id: string;
    amount: number;
    description?: string;
    transaction_date: string;
  }
): Promise<Transaction> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await withRetry(() =>
    supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, category:categories(id, name, icon, type)")
      .single()
  );

  if (error) throw toError(error);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await withRetry(() =>
    supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)
  );

  if (error) throw toError(error);
}
