"use client";

import { useState } from "react";
import type { Category } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Ellipsis } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/transactions/category-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CategoryForm,
  DeleteCategoryButton,
} from "@/components/categories/category-form";
import { PageHeader } from "@/components/layout/page-header";

interface CategoryManagerProps {
  initialCategories: Category[];
}

interface CategoryListProps {
  items: Category[];
  title: string;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

function CategoryList({ items, title, onEdit, onDelete }: CategoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada kategori</p>
        ) : (
          <div className="space-y-2">
            {items.map((cat) => {
              const IconComponent =
                (cat.icon ? CATEGORY_ICONS[cat.icon] : undefined) ?? Ellipsis;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
                      <IconComponent />
                    </span>
                  <span className="truncate text-sm font-medium">{cat.name}</span>
                  {cat.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Bawaan
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(cat)}
                  >
                    <Pencil className="size-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <DeleteCategoryButton
                    categoryId={cat.id}
                    onSuccess={() => onDelete(cat.id)}
                  />
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  function handleEdit(cat: Category) {
    setEditingCategory(cat);
    setOpenEdit(true);
  }

  function handleDelete(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Kategori" description="Kelola kategori transaksi">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Tambah
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSuccess={(newCategory) => {
                setCategories((prev) => [...prev, newCategory]);
                setOpenCreate(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div
        className="animate-fade-up grid gap-6 md:grid-cols-2"
        style={{ animationDelay: "50ms" }}
      >
        <CategoryList
          items={expenseCategories}
          title="Pengeluaran"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <CategoryList
          items={incomeCategories}
          title="Pemasukan"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              initialData={{
                id: editingCategory.id,
                name: editingCategory.name,
                type: editingCategory.type,
                icon: editingCategory.icon ?? "Ellipsis",
              }}
              onSuccess={(updatedCategory) => {
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === updatedCategory.id ? updatedCategory : c
                  )
                );
                setOpenEdit(false);
                setEditingCategory(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
