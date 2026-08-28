"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transaction.schema";
import type { Category, TransactionType } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/api/actions";

interface TransactionFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    type: TransactionType;
    category_id: string;
    amount: number;
    description: string | null;
    transaction_date: string;
  };
  defaultType?: TransactionType;
}

const rupiah = new Intl.NumberFormat("id-ID");

/** Renders the raw numeric amount as an id-ID formatted display string. */
function formatAmount(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? rupiah.format(value)
    : "";
}

export function TransactionForm({
  categories,
  initialData,
  defaultType = "expense",
}: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialData?.type ?? defaultType
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type ?? defaultType,
      category_id: initialData?.category_id ?? "",
      amount: initialData?.amount ?? undefined,
      description: initialData?.description ?? "",
      transaction_date: initialData?.transaction_date ?? "",
    },
  });

  const { field: amountField } = useController({ name: "amount", control });

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  function handleTypeChange(value: string | null) {
    if (!value) return;
    const type = value as TransactionType;
    setSelectedType(type);
    setValue("type", type);
    setValue("category_id", "");
  }

  async function onSubmit(data: TransactionInput) {
    setLoading(true);
    try {
      if (initialData) {
        await updateTransactionAction(initialData.id, data);
        toast.success("Transaksi berhasil diperbarui");
      } else {
        await createTransactionAction(data);
        toast.success("Transaksi berhasil ditambahkan");
      }
      router.push("/transactions");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Transaksi" : "Tambah Transaksi"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <Select
              value={selectedType}
              onValueChange={handleTypeChange}
              items={{ expense: "Pengeluaran", income: "Pemasukan" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedType === "expense" ? "Pengeluaran" : "Pemasukan"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={watch("category_id")}
              onValueChange={(v) => {
                if (v) setValue("category_id", v);
              }}
              items={Object.fromEntries(
                filteredCategories.map((c) => [c.id, c.name])
              )}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori">
                  {filteredCategories.find((c) => c.id === watch("category_id"))
                    ?.name ?? "Pilih kategori"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal</Label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                Rp
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                className="pl-10"
                value={formatAmount(amountField.value)}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 15);
                  amountField.onChange(
                    digits === "" ? undefined : Number(digits)
                  );
                }}
                onBlur={amountField.onBlur}
                ref={amountField.ref}
                aria-invalid={!!errors.amount}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi transaksi"
              {...register("description")}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
            <Input
              id="transaction_date"
              type="date"
              {...register("transaction_date")}
              aria-invalid={!!errors.transaction_date}
            />
            {errors.transaction_date && (
              <p className="text-sm text-destructive">
                {errors.transaction_date.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : initialData
                  ? "Simpan Perubahan"
                  : "Simpan Transaksi"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
