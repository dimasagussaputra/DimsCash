"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatTransactionDate } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import { CATEGORY_ICONS } from "./category-icons";
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTransactionAction } from "@/app/api/actions";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction: t }: TransactionItemProps) {
  const iconName = t.category?.icon;
  const IconComponent = (iconName ? CATEGORY_ICONS[iconName] : null) ?? Ellipsis;
  const isIncome = t.type === "income";

  return (
    <div className="lift group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 hover:border-primary/30">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
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
      <div className="flex shrink-0 items-center gap-2">
        <p
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            isIncome ? "text-income" : "text-expense"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(t.amount)}
        </p>
        <div className="flex items-center gap-1">
          <DetailButton transaction={t} />
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/transactions/${t.id}/edit`} />}
          >
            <Pencil className="size-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <DeleteButton transactionId={t.id} />
        </div>
      </div>
    </div>
  );
}

function DetailButton({ transaction: t }: { transaction: Transaction }) {
  const [open, setOpen] = useState(false);
  const iconName = t.category?.icon;
  const IconComponent = (iconName ? CATEGORY_ICONS[iconName] : null) ?? Ellipsis;
  const isIncome = t.type === "income";

  return (
    <>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Eye className="size-3.5" />
        <span className="sr-only">Detail</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm gap-0 p-0 overflow-hidden">
          <div className="flex flex-col items-center gap-3 pt-6 px-6 pb-4">
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                isIncome
                  ? "bg-income/10 text-income"
                  : "bg-expense/10 text-expense"
              )}
            >
              <IconComponent className="size-6" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              {t.category?.name ?? "Tanpa Kategori"}
            </p>
            <Badge variant={isIncome ? "default" : "destructive"}>
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </Badge>
          </div>

          <Separator />

          <div className="flex flex-col items-center gap-1 py-5 px-6">
            <p
              className={cn(
                "font-mono text-2xl font-bold tabular-nums",
                isIncome ? "text-income" : "text-expense"
              )}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(t.amount)}
            </p>
          </div>

          <Separator />

          <div className="grid gap-0 px-6 py-4">
            <DetailRow
              label="Tanggal Transaksi"
              value={format(new Date(t.transaction_date), "dd MMMM yyyy", { locale: id })}
            />
            <DetailRow
              label="Deskripsi"
              value={t.description || "Tanpa deskripsi"}
              muted={!t.description}
            />
            <DetailRow
              label="Dibuat"
              value={format(new Date(t.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
            />
            <DetailRow
              label="Diperbarui"
              value={format(new Date(t.updated_at), "dd MMMM yyyy, HH:mm", { locale: id })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium text-right", muted && "text-muted-foreground")}>
        {value}
      </span>
    </div>
  );
}

function DeleteButton({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteTransactionAction(transactionId);
      toast.success("Transaksi berhasil dihapus");
      router.refresh();
    } catch {
      toast.error("Gagal menghapus transaksi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" disabled={loading} />
        }
      >
        <Trash2 className="size-3.5" />
        <span className="sr-only">Hapus</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara
            permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
