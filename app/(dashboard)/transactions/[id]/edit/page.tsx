import { notFound } from "next/navigation";
import { getTransactionById } from "@/lib/services/transaction.service";
import { getCategories } from "@/lib/services/category.service";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { PageHeader } from "@/components/layout/page-header";

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([
    getTransactionById(id),
    getCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Edit Transaksi" description="Perbarui data transaksi" />
      <TransactionForm
        categories={categories}
        initialData={{
          id: transaction.id,
          type: transaction.type,
          category_id: transaction.category_id ?? "",
          amount: transaction.amount,
          description: transaction.description,
          transaction_date: transaction.transaction_date,
        }}
      />
    </div>
  );
}
