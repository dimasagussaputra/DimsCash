import { getCategories } from "@/lib/services/category.service";
import { CategoryManager } from "@/components/categories/category-manager";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoryManager initialCategories={categories} />;
}
