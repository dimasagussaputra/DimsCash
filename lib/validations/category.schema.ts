import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ required_error: "Nama kategori wajib diisi" })
    .min(1, "Nama kategori wajib diisi")
    .max(50, "Nama kategori maksimal 50 karakter"),
  type: z.enum(["income", "expense"], {
    required_error: "Pilih jenis kategori",
  }),
  icon: z
    .string({ required_error: "Pilih ikon" })
    .min(1, "Pilih ikon"),
});

export type CategoryInput = z.infer<typeof categorySchema>;