"use server";

import { revalidatePath } from "next/cache";
import {
  createTransaction as createTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
} from "@/lib/services/transaction.service";
import {
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "@/lib/services/category.service";
import {
  changePassword as changePasswordService,
  updateProfile as updateProfileService,
  uploadAvatar as uploadAvatarService,
} from "@/lib/services/profile.service";
import { transactionSchema } from "@/lib/validations/transaction.schema";
import { categorySchema } from "@/lib/validations/category.schema";
import { profileSchema, passwordSchema } from "@/lib/validations/profile.schema";

export async function createTransactionAction(payload: {
  type: "income" | "expense";
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}) {
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  const result = await createTransactionService(parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return result;
}

export async function updateTransactionAction(
  id: string,
  payload: {
    type: "income" | "expense";
    category_id: string;
    amount: number;
    description?: string;
    transaction_date: string;
  }
) {
  const parsed = transactionSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  const result = await updateTransactionService(id, parsed.data);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);
  return result;
}

export async function deleteTransactionAction(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("ID transaksi tidak valid");
  }
  await deleteTransactionService(id);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function createCategoryAction(
  name: string,
  type: "income" | "expense",
  icon: string
) {
  const parsed = categorySchema.safeParse({ name, type, icon });
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  const result = await createCategoryService(
    parsed.data.name,
    parsed.data.type,
    parsed.data.icon
  );
  revalidatePath("/categories");
  return result;
}

export async function updateCategoryAction(
  id: string,
  name: string,
  icon: string
) {
  if (!id || typeof id !== "string") {
    throw new Error("ID kategori tidak valid");
  }
  const parsed = categorySchema.safeParse({
    name,
    type: "expense",
    icon,
  });
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  const result = await updateCategoryService(id, parsed.data.name, parsed.data.icon);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteCategoryAction(id: string) {
  if (!id || typeof id !== "string") {
    throw new Error("ID kategori tidak valid");
  }
  await deleteCategoryService(id);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function updateProfileAction(fullName: string) {
  const parsed = profileSchema.safeParse({ full_name: fullName });
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  const result = await updateProfileService(parsed.data.full_name);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return result;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const parsed = passwordSchema.safeParse({
    currentPassword,
    password: newPassword,
    confirmPassword: newPassword,
  });
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Data tidak valid";
    throw new Error(firstError);
  }
  await changePasswordService(currentPassword, newPassword);
}

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File tidak valid");
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 2 MB");
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WebP");
  }
  const result = await uploadAvatarService(file);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return result;
}
