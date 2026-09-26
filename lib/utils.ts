import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const withUnit = (n: number, suffix: string) =>
    `${n.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${suffix}`;

  if (abs >= 1_000_000_000) return withUnit(amount / 1_000_000_000, "M");
  if (abs >= 1_000_000) return withUnit(amount / 1_000_000, "jt");
  if (abs >= 1_000) return `${Math.round(amount / 1_000)}rb`;
  return amount.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "dd MMM yyyy", { locale: id });
}

export function formatTransactionDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return "Hari ini";
  if (isYesterday(date)) return "Kemarin";
  return format(date, "dd MMM yyyy", { locale: id });
}

export function formatMonthLabel(date: Date, long = false): string {
  return format(date, long ? "MMMM yyyy" : "MMM yyyy", { locale: id });
}

export function getInitials(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
