import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { getProfile } from "@/lib/services/profile.service";
import { Button } from "@/components/ui/button";
import { GreetingText } from "./greeting-text";

export async function DashboardGreeting() {
  const profile = await getProfile();
  const name = profile?.full_name?.trim();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <GreetingText name={name} />
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
