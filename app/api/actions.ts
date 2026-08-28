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

export async function createTransactionAction(payload: {
  type: "income" | "expense";
  category_id: string;
  amount: number;
  description?: string;
  transaction_date: string;
}) {
  const result = await createTransactionService(payload);
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
  const result = await updateTransactionService(id, payload);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}/edit`);
  return result;
}

export async function deleteTransactionAction(id: string) {
  await deleteTransactionService(id);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function createCategoryAction(
  name: string,
  type: "income" | "expense",
  icon: string
) {
  const result = await createCategoryService(name, type, icon);
  revalidatePath("/categories");
  return result;
}

export async function updateCategoryAction(
  id: string,
  name: string,
  icon: string
) {
  const result = await updateCategoryService(id, name, icon);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteCategoryAction(id: string) {
  await deleteCategoryService(id);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function updateProfileAction(fullName: string) {
  const result = await updateProfileService(fullName);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return result;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  await changePasswordService(currentPassword, newPassword);
}

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("File tidak valid");
  const result = await uploadAvatarService(file);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return result;
}
