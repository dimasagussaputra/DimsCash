import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Pilih jenis transaksi",
  }),
  category_id: z
    .string({ required_error: "Pilih kategori" })
    .min(1, "Pilih kategori"),
  amount: z.coerce
    .number({ invalid_type_error: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0"),
  description: z
    .string()
    .max(200, "Deskripsi maksimal 200 karakter")
    .optional()
    .or(z.literal("")),
  transaction_date: z
    .string({ required_error: "Pilih tanggal transaksi" })
    .min(1, "Pilih tanggal transaksi"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;