// app/recipes/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";

import RecipeClient from "./RecipeClient";

const BUCKET = "recipe-images";

type RecipeRow = {
  id: number;
  title: string;
  text: string;
  pages: string[]; // storage paths or filenames
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
    .select("id,title,text,pages")
    .eq("id", recipeId)
    .single<RecipeRow>();

  if (error !== null ){
    return <>error</>
  }

const paths = Array.isArray(recipe.pages)
  ? recipe.pages.map((item) => `page_${item}.jpeg`)
  : [];

  const imageUrls = paths.map((path) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { path, url: data.publicUrl };
  });


  

  return <RecipeClient recipe={recipe} imageUrls={imageUrls} />;
}
