import { z } from "zod";

export const profileSchema = z.object({
  full_name: z
    .string({ required_error: "Nama wajib diisi" })
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter"),
});

export const passwordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: "Kata sandi lama wajib diisi",
      })
      .min(1, "Kata sandi lama wajib diisi"),
    password: z
      .string({ required_error: "Kata sandi baru wajib diisi" })
      .min(6, "Kata sandi baru minimal 6 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi kata sandi wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
