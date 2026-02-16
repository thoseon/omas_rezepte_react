// components/app-sidebar.server.tsx
import { createClient } from "@/lib/supabase/server";
import { AppSidebarClient } from "./app-sidebar.client";

export type RecipeNavItem = {
  id: number;
  title: string;
};

export async function AppSidebar() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title")
    .order("title", { ascending: true });

  if (error) {
    return <AppSidebarClient recipes={[]} />;
  }

  const recipes: RecipeNavItem[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
  }));

  return <AppSidebarClient recipes={recipes} />;
}
