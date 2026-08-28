import { cn } from "@/lib/utils";

interface LedgerRow {
  name: string;
  category: string;
  amount: string;
  type: "income" | "expense";
}

const rows: LedgerRow[] = [
  {
    name: "Gaji bulanan",
    category: "Pemasukan",
    amount: "+Rp5.400.000",
    type: "income",
  },
  {
    name: "Belanja mingguan",
    category: "Makanan",
    amount: "-Rp185.000",
    type: "expense",
  },
  {
    name: "Kopi & jajan",
    category: "Jajan",
    amount: "-Rp42.000",
    type: "expense",
  },
];

/**
 * Static sample ledger shown on the auth brand panel — sells the product
 * by showing its shape, not by claiming features.
 */
export function LedgerPreview() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-card p-5 text-card-foreground shadow-xl shadow-black/25 ring-1 ring-white/10">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          Aktivitas terakhir
        </p>
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground/80 uppercase">
          Ags &rsquo;26
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <li
            key={row.name}
            className="animate-fade-up flex items-center gap-3"
            style={{ animationDelay: `${140 + i * 90}ms` }}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                row.type === "income" ? "bg-income" : "bg-expense"
              )}
            />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium">
                {row.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {row.category}
              </span>
            </span>
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                row.type === "income" ? "text-income" : "text-expense"
              )}
            >
              {row.amount}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-baseline justify-between border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground">Selisih</p>
        <p className="font-mono text-sm font-bold tabular-nums text-income">
          +Rp5.173.000
        </p>
      </div>
    </div>
  );
}
