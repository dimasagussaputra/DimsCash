import { getCategories } from "@/lib/services/category.service";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { PageHeader } from "@/components/layout/page-header";
import type { TransactionType } from "@/types/transaction";

interface NewTransactionPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const [{ type }, categories] = await Promise.all([
    searchParams,
    getCategories(),
  ]);
  const defaultType: TransactionType = type === "income" ? "income" : "expense";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Tambah Transaksi"
        description="Catat pemasukan atau pengeluaran baru"
      />
      <TransactionForm categories={categories} defaultType={defaultType} />
    </div>
  );
}
