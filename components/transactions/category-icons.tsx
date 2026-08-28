import {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Clapperboard,
  ReceiptText,
  Ellipsis,
  Wallet,
  Briefcase,
  Store,
  TrendingUp,
  Gift,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Clapperboard,
  ReceiptText,
  Ellipsis,
  Wallet,
  Briefcase,
  Store,
  TrendingUp,
  Gift,
};

export function getCategoryIcon(iconName: string | null): LucideIcon {
  if (!iconName || !(iconName in CATEGORY_ICONS)) {
    return Ellipsis;
  }
  return CATEGORY_ICONS[iconName];
}
