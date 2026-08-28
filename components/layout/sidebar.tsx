"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Tag,
  LogOut,
  ChevronsUpDown,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transaksi", href: "/transactions", icon: ArrowRightLeft },
  { label: "Kategori", href: "/categories", icon: Tag },
  { label: "Profil", href: "/profile", icon: UserIcon },
];

/* -------------------------------------------------------------------------
 * Persisted collapse state — useSyncExternalStore keeps SSR/hydration safe.
 * ---------------------------------------------------------------------- */

const COLLAPSE_KEY = "dimscash-sidebar-collapsed";

const collapseListeners = new Set<() => void>();

function subscribeCollapse(callback: () => void) {
  collapseListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    collapseListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getCollapseSnapshot(): boolean {
  return localStorage.getItem(COLLAPSE_KEY) === "true";
}

function getServerCollapseSnapshot(): boolean {
  return false;
}

function setCollapseStored(value: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, String(value));
  } catch {}
  collapseListeners.forEach((listener) => listener());
}

export function Sidebar() {
  const collapsed = useSyncExternalStore(
    subscribeCollapse,
    getCollapseSnapshot,
    getServerCollapseSnapshot
  );

  const toggleCollapsed = useCallback(() => {
    setCollapseStored(!getCollapseSnapshot());
  }, []);

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:flex",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} />

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Perbesar menu" : "Perkecil menu"}
        aria-expanded={!collapsed}
        className="absolute top-[70px] -right-3 z-10 flex size-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-3.5 transition-transform duration-300 motion-reduce:transition-none",
            collapsed ? "rotate-180" : ""
          )}
          aria-hidden="true"
        >
          <path d="m11 17-5-5 5-5" />
          <path d="m18 17-5-5 5-5" />
        </svg>
      </button>
    </aside>
  );
}

interface SidebarContentProps {
  collapsed?: boolean;
}

export function SidebarContent({ collapsed = false }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (!data.user) {
        setAvatarUrl(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      setAvatarUrl(profile?.avatar_url ?? null);
    }

    loadProfile();

    /* Live refresh after the profile form saves. */
    window.addEventListener("profile:updated", loadProfile);
    return () => window.removeEventListener("profile:updated", loadProfile);
  }, [supabase]);

  /* Never render the raw email — it is considered confidential. Show the
   * registered name instead, falling back to the email's local part. */
  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    null;

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border",
          collapsed ? "justify-center" : "px-5"
        )}
      >
        <Image
          src="/DimsCash.jpg"
          alt="DimsCash Logo"
          width={36}
          height={36}
          className="size-9 rounded-full object-cover shadow-sm ring-1 ring-primary/40"
          priority
        />
        <div
          className={cn(
            "min-w-0 overflow-hidden whitespace-nowrap leading-tight transition-all duration-300 ease-in-out motion-reduce:transition-none",
            collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
          )}
        >
          <p className="font-bold tracking-tight">DimsCash</p>
          <p className="text-[11px] text-muted-foreground">
            Keuangan pribadi
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out motion-reduce:transition-none",
                collapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
              )}
              <item.icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "truncate transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu akun"
                className={cn(
                  "flex w-full items-center rounded-lg text-left transition-all duration-300 ease-in-out hover:bg-sidebar-accent motion-reduce:transition-none",
                  collapsed ? "justify-center gap-0 p-2" : "gap-3 p-2"
                )}
              />
            }
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Foto profil"
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {(displayName?.[0] ?? "?").toUpperCase()}
              </span>
            )}
            <span
              className={cn(
                "min-w-0 flex-1 overflow-hidden leading-tight transition-all duration-300 ease-in-out motion-reduce:transition-none",
                collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
              )}
            >
              <span className="block truncate text-sm font-medium">
                {displayName ?? "Memuat..."}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Akun saya
              </span>
            </span>
            {!collapsed && (
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{displayName ?? "Akun"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
