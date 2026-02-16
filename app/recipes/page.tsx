import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function RecipesData() {
  const supabase = await createClient();
  const { data: recipes } = await supabase.from("recipes").select();

  return <pre>{JSON.stringify(recipes, null, 2)}</pre>;
}

export default function Recipes() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <RecipesData />
    </Suspense>
  );
}