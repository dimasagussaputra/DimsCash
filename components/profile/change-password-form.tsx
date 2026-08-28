"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  passwordSchema,
  type PasswordInput,
} from "@/lib/validations/profile.schema";
import { changePasswordAction } from "@/app/api/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput as PasswordField } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: PasswordInput) {
    try {
      await changePasswordAction(data.currentPassword, data.password);
      toast.success("Kata sandi berhasil diperbarui");
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti Kata Sandi</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Kata Sandi Lama</Label>
            <PasswordField
              id="currentPassword"
              placeholder="Masukkan kata sandi saat ini"
              {...register("currentPassword")}
              aria-invalid={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi Baru</Label>
            <PasswordField
              id="password"
              placeholder="Minimal 6 karakter"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <PasswordField
              id="confirmPassword"
              placeholder="Ulangi kata sandi baru"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Memperbarui…" : "Perbarui Kata Sandi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
