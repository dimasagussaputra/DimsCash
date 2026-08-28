import type { Metadata } from "next";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LedgerPreview } from "@/components/auth/ledger-preview";

export const metadata: Metadata = {
  title: "DimsCash",
  description: "Aplikasi manajemen keuangan pribadi",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only. Deep teal ink with a live-shaped
       * sample of the product, instead of marketing bullets. */}
      <aside className="relative hidden overflow-hidden bg-teal-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-0 size-[28rem] rounded-full bg-teal-400/10 blur-3xl"
        />

        <header className="relative flex items-center gap-3">
          <Image
            src="/DimsCash.jpg"
            alt="DimsCash Logo"
            width={44}
            height={44}
            className="size-11 rounded-full object-cover shadow-lg ring-1 ring-primary/60"
            priority
          />
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-tight">DimsCash</p>
            <p className="font-mono text-[11px] tracking-[0.22em] text-teal-200/70 uppercase">
              Buku kas pribadi
            </p>
          </div>
        </header>

        <div className="relative max-w-xl">
          <h2 className="max-w-lg text-4xl leading-[1.15] font-bold tracking-tight">
            Kelola uangmu dengan tenang, capai rencanamu dengan yakin.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-teal-100/70">
            Setiap pemasukan dan pengeluaran tercatat rapi dalam satu buku kas
            yang selalu siap dibaca — kapan pun kamu butuh.
          </p>
          <div className="animate-fade-up mt-10" style={{ animationDelay: "120ms" }}>
            <LedgerPreview />
          </div>
        </div>

        <p className="relative font-mono text-[11px] tracking-wide text-teal-100/50">
          &copy; {new Date().getFullYear()} DimsCash &middot; Aplikasi
          manajemen keuangan pribadi
        </p>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col items-center justify-center gap-6 bg-background px-4 py-10 sm:px-8">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
