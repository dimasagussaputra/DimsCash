import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .min(1, "Email wajib diisi")
    .email("Email tidak valid"),
  password: z
    .string({ required_error: "Kata sandi wajib diisi" })
    .min(6, "Kata sandi minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    full_name: z
      .string({ required_error: "Nama wajib diisi" })
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter"),
    email: z
      .string({ required_error: "Email wajib diisi" })
      .min(1, "Email wajib diisi")
      .email("Email tidak valid"),
    password: z
      .string({ required_error: "Kata sandi wajib diisi" })
      .min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi kata sandi wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;