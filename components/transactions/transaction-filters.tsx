"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import type { Category } from "@/types/transaction";

const TYPE_LABELS: Record<string, string> = {
  all: "Semua Jenis",
  income: "Pemasukan",
  expense: "Pengeluaran",
};

const SORT_LABELS: Record<string, string> = {
  desc: "Terbaru",
  asc: "Terlama",
};

const SEARCH_DEBOUNCE_MS = 350;

interface TransactionFiltersProps {
  categories: Category[];
}

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Pushes new params and resets pagination. */
  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/transactions?${params.toString()}`, { scroll: false });
  }

  function debouncedUpdate(key: string, value: string | null) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam(key, value), SEARCH_DEBOUNCE_MS);
  }

  function resetFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/transactions", { scroll: false });
  }

  const hasActiveFilters =
    !!searchParams.get("search") ||
    (searchParams.get("type") && searchParams.get("type") !== "all") ||
    !!searchParams.get("categoryId") ||
    !!searchParams.get("from") ||
    !!searchParams.get("to");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari transaksi..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => debouncedUpdate("search", e.target.value || null)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
        <Select
          defaultValue={searchParams.get("type") ?? "all"}
          onValueChange={(v) => updateParam("type", v)}
          items={{
            all: TYPE_LABELS.all,
            income: TYPE_LABELS.income,
            expense: TYPE_LABELS.expense,
          }}
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue>
              {TYPE_LABELS[searchParams.get("type") ?? "all"]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("categoryId") ?? "all"}
          onValueChange={(v) => updateParam("categoryId", v)}
          items={{
            all: "Semua Kategori",
            ...Object.fromEntries(
              categories.map((c) => [c.id, c.name])
            ),
          }}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue>
              {categories.find(
                (c) => c.id === searchParams.get("categoryId")
              )?.name ?? "Semua Kategori"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          aria-label="Tanggal mulai"
          title="Dari tanggal"
          defaultValue={searchParams.get("from") ?? ""}
          max={searchParams.get("to") ?? undefined}
          onChange={(e) => updateParam("from", e.target.value || null)}
          className="w-full lg:w-[150px]"
        />
        <Input
          type="date"
          aria-label="Tanggal akhir"
          title="Sampai tanggal"
          defaultValue={searchParams.get("to") ?? ""}
          min={searchParams.get("from") ?? undefined}
          onChange={(e) => updateParam("to", e.target.value || null)}
          className="w-full lg:w-[150px]"
        />

        <Select
          defaultValue={searchParams.get("sort") ?? "desc"}
          onValueChange={(v) => updateParam("sort", v === "desc" ? null : v)}
          items={{ desc: SORT_LABELS.desc, asc: SORT_LABELS.asc }}
        >
          <SelectTrigger className="col-span-2 w-full sm:col-span-1 lg:w-[130px]">
            <SelectValue>
              {SORT_LABELS[searchParams.get("sort") ?? "desc"]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground max-lg:col-span-2"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
