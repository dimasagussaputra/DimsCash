import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTransactionDate } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import { ArrowRight } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/transactions/category-icons";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/transactions" />}>
          Lihat Semua
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
            <p className="text-sm font-medium">Belum ada transaksi</p>
            <p className="text-sm text-muted-foreground">
              Mulai catat pemasukan dan pengeluaranmu
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((t) => {
              const iconName = t.category?.icon ?? "Ellipsis";
              const IconComponent =
                CATEGORY_ICONS[iconName] ?? CATEGORY_ICONS.Ellipsis;
              const isIncome = t.type === "income";
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        isIncome
                          ? "bg-income/10 text-income"
                          : "bg-expense/10 text-expense"
                      )}
                    >
                      <IconComponent className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.category?.name ?? "Tanpa Kategori"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.description ?? "Tanpa deskripsi"} &bull;{" "}
                        {formatTransactionDate(t.transaction_date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 font-mono text-sm font-semibold tabular-nums",
                      isIncome ? "text-income" : "text-expense"
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
