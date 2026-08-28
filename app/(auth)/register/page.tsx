"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthPanel } from "@/components/auth/auth-panel";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Akun berhasil dibuat");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthPanel
      title="Buat Akun DimsCash"
      description="Isi data diri Anda untuk mendaftar"
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input
            id="full_name"
            placeholder="Nama Anda"
            {...register("full_name")}
            aria-invalid={!!errors.full_name}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Alamat email Anda"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <PasswordInput
            id="password"
            placeholder="Minimal 6 karakter"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Ulangi kata sandi"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Mendaftar..." : "Daftar"}
        </Button>
      </form>
    </AuthPanel>
  );
}
