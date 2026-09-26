"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <section className="nm-raised animate-fade-up w-full max-w-sm rounded-3xl border border-border bg-card p-6 sm:p-8">
        <header className="text-center">
          <span className="nm-inset mx-auto flex size-16 items-center justify-center rounded-full bg-background p-2.5">
            <TriangleAlert className="size-7 text-destructive" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
            Terjadi kesalahan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error.message || "Data tidak dapat dimuat. Silakan coba lagi."}
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Coba lagi
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Muat ulang halaman
          </Button>
        </div>
      </section>
    </div>
  );
}
