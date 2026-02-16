import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function RecipeInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipeId = Number(id);

  const supabase = await createClient();
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .single();

  if (error) return <pre>{JSON.stringify({ error: error.message }, null, 2)}</pre>;
  return (
    <div>
      WIESOOOOOOOOOOOOOOOOOOOOOOO
    </div>
  );
}

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Lade Rezept…</div>}>
      <RecipeInner params={params} />
    </Suspense>
  );
}
