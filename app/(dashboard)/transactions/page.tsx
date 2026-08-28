import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTransactions } from "@/lib/services/transaction.service";
import { getCategories } from "@/lib/services/category.service";
import { TransactionItem } from "@/components/transactions/transaction-item";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionsPagination } from "@/components/transactions/transactions-pagination";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Inbox } from "lucide-react";

interface TransactionsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    categoryId?: string;
    from?: string;
    to?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    getTransactions({
      search: params.search,
      type: params.type && params.type !== "all" ? (params.type as "income" | "expense") : undefined,
      categoryId: params.categoryId,
      from: params.from,
      to: params.to,
      sort: params.sort === "asc" ? "asc" : "desc",
      page: Number(params.page) || 1,
    }),
    getCategories(),
  ]);

  // Page out of range (e.g., after deletions) — land on the last page.
  if (result.data.length === 0 && result.page > result.totalPages && result.total > 0) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") sp.set(key, value);
    }
    if (result.totalPages > 1) sp.set("page", String(result.totalPages));
    redirect(`/transactions?${sp.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transaksi" description="Kelola pemasukan dan pengeluaran">
        <Button render={<Link href="/transactions/new" />} size="sm" className="max-lg:hidden">
          <Plus className="size-4" />
          Tambah
        </Button>
      </PageHeader>

      <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <Suspense>
          <TransactionFilters categories={categories} />
        </Suspense>
      </div>

      {result.data.length === 0 ? (
        <div className="animate-fade-up flex flex-col items-center justify-center rounded-2xl border border-dashed py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-6 text-muted-foreground" />
          </span>
          <p className="mt-4 font-medium">
            {result.total === 0 ? "Belum ada transaksi" : "Tidak ada hasil"}
          </p>
          <p className="text-sm text-muted-foreground">
            {result.total === 0
              ? "Mulai catat pemasukan dan pengeluaranmu"
              : "Coba ubah kata kunci atau reset filter"}
          </p>
          <Button render={<Link href="/transactions/new" />} className="mt-4" size="sm">
            <Plus className="size-4" />
            Tambah Transaksi
          </Button>
        </div>
      ) : (
        <>
          <div
            className="animate-fade-up space-y-2"
            style={{ animationDelay: "110ms" }}
          >
            {result.data.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
          {result.totalPages > 1 && (
            <div
              className="animate-fade-up pt-2"
              style={{ animationDelay: "170ms" }}
            >
              <TransactionsPagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                limit={result.limit}
                params={{
                  search: params.search,
                  type: params.type,
                  categoryId: params.categoryId,
                  from: params.from,
                  to: params.to,
                  sort: params.sort,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
