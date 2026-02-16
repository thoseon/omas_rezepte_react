import { Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BUCKET = "recipe-images";
const SIGNED_URL_TTL_SECONDS = 60 * 10;

type RecipeRow = {
  id: number;
  title: string;
  text: string;
  pages: string[];
};

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
    .select("id,title,text,pages,pages")
    .eq("id", recipeId)
    .single<RecipeRow>();

  if (error) return <pre>{JSON.stringify({ error: error.message }, null, 2)}</pre>;
  if (!recipe) return <pre>{JSON.stringify({ error: "Not found" }, null, 2)}</pre>;

const paths = recipe.pages.map(() => "seite_001.jpg");

const imageUrls = paths.map((path) => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
});

const backgroundUrl = imageUrls[0]?.url;



  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* dynamic background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={backgroundUrl}
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-black/55" />

      <main className="min-h-screen px-6 pt-6 pb-10 md:px-10">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {/* optional image strip (all images) */}
          {imageUrls.length > 0 && (
            <div className="flex gap-3 overflow-x-auto rounded-2xl border bg-background/70 p-3 backdrop-blur-md">
              {imageUrls.map((img) => (
                <div
                  key={img.path}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <Card className="border rounded-2xl bg-background/75 backdrop-blur-md">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-4xl font-semibold">
                {recipe.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="rounded-xl border bg-muted/30 p-6 text-base leading-relaxed">
                <pre className="whitespace-pre-wrap font-sans">
                  {recipe.text}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6">Lade Rezept…</div>}>
      <RecipeInner params={params} />
    </Suspense>
  );
}
