"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Tag,
  User as UserIcon,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
  { label: "Kategori", href: "/categories", icon: Tag },
  { label: "Profil", href: "/profile", icon: UserIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  function renderItem(item: NavItem) {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "nm-soft flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-1 text-[11px] active:scale-95 motion-reduce:active:scale-100",
          isActive
            ? "font-semibold text-primary"
            : "font-medium text-muted-foreground hover:text-foreground"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "nm-soft flex size-9 items-center justify-center rounded-full",
            isActive && "nm-inset"
          )}
        >
          <item.icon className="size-5" />
        </span>
        {item.label}
      </Link>
    );
  }

  return (
    <nav
      suppressHydrationWarning
      className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 lg:hidden"
    >
      <div className="nm-raised flex items-center justify-around rounded-[1.75rem] bg-background px-2 py-2">
        {navItems.slice(0, 2).map(renderItem)}

        <Link
          href="/transactions/new"
          aria-label="Tambah transaksi"
          className="nm-raised mx-1 -mt-7 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Plus className="size-6" aria-hidden="true" />
        </Link>

        {navItems.slice(2).map(renderItem)}
      </div>
    </nav>
  );
}
