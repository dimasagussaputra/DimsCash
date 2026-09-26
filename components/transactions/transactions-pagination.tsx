import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  /** Current query params (without "page") preserved across navigation. */
  params: Record<string, string | undefined>;
}

function buildHref(
  params: TransactionsPaginationProps["params"],
  page: number
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") sp.set(key, value);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return `/transactions${qs ? `?${qs}` : ""}`;
}

/**
 * Page items with smart ellipsis: always shows the first and last page plus
 * a window of current ± 1; gaps collapse into "…". Ranges of up to 7 pages
 * are shown in full.
 */
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}

export function TransactionsPagination({
  page,
  totalPages,
  total,
  limit,
  params,
}: TransactionsPaginationProps) {
  const showingFrom = (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Navigasi halaman transaksi"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Menampilkan{" "}
        <span className="font-medium text-foreground tabular-nums">
          {showingFrom}&ndash;{showingTo}
        </span>{" "}
        dari{" "}
        <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
        transaksi
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <PagerLink
          href={buildHref(params, 1)}
          disabled={page <= 1}
          label="Ke halaman pertama"
          className="hidden sm:flex"
        >
          <ChevronsLeft className="size-4" />
        </PagerLink>

        <PagerLink
          href={buildHref(params, page - 1)}
          disabled={page <= 1}
          label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </PagerLink>

        {getPageItems(page, totalPages).map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex size-8 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="size-4" />
              </span>
            );
          }
          if (item === page) {
            return (
              <span
                key={item}
                aria-current="page"
                className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground tabular-nums"
              >
                {item}
              </span>
            );
          }
          return (
            <Link
              key={item}
              href={buildHref(params, item)}
              aria-label={`Halaman ${item}`}
              className="flex size-8 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground tabular-nums focus-visible:outline-2 focus-visible:outline-ring"
            >
              {item}
            </Link>
          );
        })}

        <PagerLink
          href={buildHref(params, page + 1)}
          disabled={page >= totalPages}
          label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="size-4" />
        </PagerLink>

        <PagerLink
          href={buildHref(params, totalPages)}
          disabled={page >= totalPages}
          label="Ke halaman terakhir"
          className="hidden sm:flex"
        >
          <ChevronsRight className="size-4" />
        </PagerLink>
      </div>
    </nav>
  );
}

function PagerLink({
  href,
  disabled,
  label,
  className,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        "flex h-8 items-center gap-0.5 rounded-lg border px-2 text-sm font-medium transition-colors",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
    >
      {children}
    </Link>
  );
}
