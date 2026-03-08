import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";


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

export default async function Home() {
  const supabase = await createClient();

  const { data: recipesData } = await supabase
    .from("recipes")
    .select("category");

  // Distinct category names from the DB, sorted
  const categoryNames = [
    ...new Set(
      (recipesData ?? []).map((r: { category: unknown }) => r.category).filter((c): c is string => typeof c === "string"),
    ),
  ].sort();

  const categories = categoryNames.map((name) => {
    const { data } = supabase.storage
      .from("recipe-categories")
      .getPublicUrl(`${toSlug(name)}.jpg`);
    return { slug: name, name, url: data.publicUrl };
  });

  const { data: coverData } = supabase.storage
    .from("recipe-categories")
    .getPublicUrl("cover.jpg");
  const bookCoverUrl = coverData.publicUrl;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Book Cover Hero */}
      <section className="flex flex-col items-center gap-6 pt-4">
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <Image
            src={bookCoverUrl}
            alt="Omas Rezeptbuch"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Omas Rezepte</h1>
          <p className="text-muted-foreground text-sm">
            
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">Inhaltsverzeichnis</h2>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine Kategorien gefunden.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${encodeURIComponent(cat.slug)}`}
                className="group block rounded-xl overflow-hidden ring-1 ring-black/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-amber-50">
                  <Image
                    src={cat.url}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium leading-tight">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
