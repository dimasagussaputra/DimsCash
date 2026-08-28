"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Berhasil keluar");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
      Keluar
    </Button>
  );
}
