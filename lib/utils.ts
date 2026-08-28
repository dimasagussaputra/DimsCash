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

export function getInitials(name: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
