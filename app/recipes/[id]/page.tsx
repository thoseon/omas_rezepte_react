// app/recipes/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";

import RecipeClient from "./RecipeClient";

const BUCKET = "recipe-images";

type RecipeRow = {
  id: number;
  title: string;
  instructions: string;
  servings: { amount: number; type: string } | null;
  ingredients: { item: string; quantity: number | null; unit: string | null }[] | null;
  source_pages: number[];
  category: string;
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = Number(id);
  if (!Number.isFinite(recipeId)) {
    return <pre>{JSON.stringify({ error: "Invalid id" }, null, 2)}</pre>;
  }

  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id,title,instructions,servings,ingredients,source_pages, category")
    .eq("id", recipeId)
    .single<RecipeRow>();

  if (error !== null ){
    return <>error</>
  }

  const { data: { user } } = await supabase.auth.getUser();

const paths = Array.isArray(recipe.source_pages)
  ? recipe.source_pages.map((item) => `page_${item.toString()}.jpeg`)
  : [];


  const imageUrls = paths.map((path) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, url: data.publicUrl };
  });


  return <RecipeClient recipe={recipe} imageUrls={imageUrls} isLoggedIn={user !== null} />;
}
