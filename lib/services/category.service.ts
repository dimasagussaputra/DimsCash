import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/transaction";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getCategoriesByType(
  type: "income" | "expense"
): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("type", type)
    .order("is_default", { ascending: false })
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  name: string,
  type: "income" | "expense",
  icon: string
): Promise<Category> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, type, icon, user_id: user.id, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  name: string,
  icon: string
): Promise<Category> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .update({ name, icon })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
