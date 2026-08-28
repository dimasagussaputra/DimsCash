"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validations/category.schema";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/api/actions";
import type { Category, TransactionType } from "@/types/transaction";
import { CATEGORY_ICONS } from "@/components/transactions/category-icons";
import { Ellipsis, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ICON_OPTIONS = [
  "Utensils",
  "Car",
  "ShoppingBag",
  "GraduationCap",
  "HeartPulse",
  "Clapperboard",
  "ReceiptText",
  "Wallet",
  "Briefcase",
  "Store",
  "TrendingUp",
  "Gift",
  "Ellipsis",
];

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    type: TransactionType;
    icon: string;
  };
  onSuccess?: (category: Category) => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? "expense",
      icon: initialData?.icon ?? "Ellipsis",
    },
  });

  async function onSubmit(data: CategoryInput) {
    setLoading(true);
    try {
      if (initialData) {
        const result = await updateCategoryAction(initialData.id, data.name, data.icon);
        toast.success("Kategori berhasil diperbarui");
        onSuccess?.(result);
      } else {
        const result = await createCategoryAction(data.name, data.type, data.icon);
        toast.success("Kategori berhasil ditambahkan");
        onSuccess?.(result);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Kategori</Label>
        <Input
          id="name"
          placeholder="Nama kategori"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {!initialData && (
        <div className="space-y-2">
          <Label>Jenis</Label>
          <Select
            value={watch("type")}
            onValueChange={(v) => setValue("type", v as TransactionType)}
            items={{ expense: "Pengeluaran", income: "Pemasukan" }}
          >
            <SelectTrigger>
              <SelectValue>
                {watch("type") === "expense" ? "Pengeluaran" : "Pemasukan"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Ikon</Label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((icon) => {
            const IconComponent = CATEGORY_ICONS[icon] ?? Ellipsis;
            return (
              <button
                key={icon}
                type="button"
                aria-label={icon}
                title={icon}
                onClick={() => setValue("icon", icon)}
                className={`rounded-lg border p-2 transition-colors ${
                  watch("icon") === icon
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <IconComponent className="size-4" />
              </button>
            );
          })}
        </div>
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : initialData ? "Simpan" : "Tambah"}
      </Button>
    </form>
  );
}

export function DeleteCategoryButton({
  categoryId,
  onSuccess,
}: {
  categoryId: string;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteCategoryAction(categoryId);
      toast.success("Kategori berhasil dihapus");
      onSuccess?.();
    } catch {
      toast.error("Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" disabled={loading} />}
      >
        <Trash2 className="size-3.5" />
        <span className="sr-only">Hapus</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara
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
