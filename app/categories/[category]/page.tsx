import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ category: string }>;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ü/g, "ue")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/\./g, "")
    .replace(/\s+/g, "-");
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const slug = decodeURIComponent(category);

  const supabase = await createClient();

  const { data: imageData } = supabase.storage
    .from("recipe-categories")
    .getPublicUrl(`${toSlug(slug)}.jpg`);

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, source_pages")
    .ilike("category", slug.replace(/[-_]/g, " "))
    .order("source_pages");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← Übersicht
        </Link>
      </div>

      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-amber-50">
        <Image
          src={imageData.publicUrl}
          alt={slug}
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight">{slug}</h1>
        <p className="text-muted-foreground text-sm">{recipes?.length ?? 0} Rezepte</p>
      </div>

      {!recipes || recipes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Keine Rezepte in dieser Kategorie gefunden.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl ring-1 ring-border overflow-hidden">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipes/${recipe.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
              >
                <span className="font-medium group-hover:underline underline-offset-2">
                  {recipe.title}
                </span>
                {recipe.source_pages?.length > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    S. {recipe.source_pages.join(", ")}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
