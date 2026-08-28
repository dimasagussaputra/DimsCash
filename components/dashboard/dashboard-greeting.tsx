import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { getProfile } from "@/lib/services/profile.service";
import { Button } from "@/components/ui/button";

function greetingForHour(hour: number): string {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export async function DashboardGreeting() {
  const profile = await getProfile();
  const greeting = greetingForHour(new Date().getHours());
  const name = profile?.full_name?.trim();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}
          {name ? <>, {name}</> : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan kondisi keuangan Anda hari ini
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" render={<Link href="/transactions/new?type=expense" />}>
          <Plus className="size-4" />
          Transaksi
        </Button>
        <Button
          size="sm"
          variant="ghost"
          render={<Link href="/categories" />}
        >
          <Tags className="size-4" />
          Kategori
        </Button>
      </div>
    </div>
  );
}
