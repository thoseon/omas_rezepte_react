"use client";

import { BookOpen, ChefHat, ShoppingBasket, Users } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type Ingredient = { item: string; quantity: number | null; unit: string | null };
type Servings = { amount: number; type: string };

type RecipeRow = {
  id: number;
  title: string;
  instructions: string;
  servings: Servings | null;
  ingredients: Ingredient[] | null;
  source_pages: number[];
  category: string;
};

export default function RecipeClient({
  recipe,
  imageUrls,
  isLoggedIn,
}: {
  recipe: RecipeRow;
  imageUrls: { path: string; url: string }[];
  isLoggedIn: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(recipe.title);
  const [category, setCategory] = useState(recipe.category);
  const [instructions, setInstructions] = useState(recipe.instructions);
  const [servings, setServings] = useState<Servings>(
    recipe.servings ?? { amount: 0, type: "" }
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const backgroundUrl = imageUrls[0]?.url ?? "";

  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recipes")
      .update({ title, category, instructions, servings, ingredients })
      .eq("id", recipe.id)
      .select();
    setSaving(false);
    if (error) {
      setSaveErr(error.message);
    } else if (!data.length) {
      setSaveErr("Keine Zeile aktualisiert – RLS-Policy prüfen");
    } else {
      setEditing(false);
    }
  }

  function handleCancel() {
    setTitle(recipe.title);
    setCategory(recipe.category);
    setInstructions(recipe.instructions);
    setServings(recipe.servings ?? { amount: 0, type: "" });
    setIngredients(recipe.ingredients ?? []);
    setSaveErr(null);
    setEditing(false);
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => {
        if (i !== index) return ing;
        if (field === "quantity") {
          const n = parseFloat(value);
          return { ...ing, quantity: value === "" ? null : isNaN(n) ? null : n };
        }
        return { ...ing, [field]: value === "" ? null : value };
      })
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { item: "", quantity: null, unit: null }]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  const slides = imageUrls.map((img) => ({ src: img.url }));

  return (
    <Suspense fallback={<div className="p-6">Lade Rezept…</div>}>
      <div className="relative min-h-screen w-full">

        <div className="absolute inset-0">
          {backgroundUrl ? (
            <Image
              src={backgroundUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* CONTENT ABOVE BACKGROUND */}
        <main className="relative min-h-screen px-6 pt-6 pb-10 md:px-10">
          <div className="mx-auto w-full max-w-5xl space-y-6">

            {/* ORIGINAL PAGES GALLERY — shown above recipe */}
            {imageUrls.length > 0 && (
              <Card className="rounded-2xl border border-border/70 bg-background/80 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Originalseiten</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-4">
                  <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {imageUrls.map((img, i) => (
                      <button
                        key={img.path}
                        type="button"
                        aria-label={`Seite ${String(i + 1)} vergrößern`}
                        className="relative h-40 w-[6.5rem] shrink-0 cursor-zoom-in overflow-hidden rounded-xl border-2 border-border/60 bg-muted shadow-md transition-all duration-200 hover:scale-[1.04] hover:shadow-lg hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => { setLightboxIndex(i); }}
                      >
                        <Image
                          src={img.url}
                          alt={`Seite ${String(i + 1)}`}
                          fill
                          sizes="104px"
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent py-1 text-center">
                          <span className="text-[10px] font-medium text-white/90">{i + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border border-border/70 bg-background/90 backdrop-blur-md shadow-md">
              <CardHeader className="pb-3 pt-6 px-8">
                <div className="flex items-start gap-3">
                  {editing ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); }}
                        className="text-2xl font-semibold"
                        placeholder="Titel"
                      />
                      <Input
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); }}
                        placeholder="Kategorie"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 text-center">
                      {category && (
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {category}
                        </p>
                      )}
                      <CardTitle className="text-4xl font-bold tracking-tight leading-tight">
                        {title}
                      </CardTitle>
                      <div className="mt-5 flex justify-center">
                        <Separator className="w-16" />
                      </div>
                    </div>
                  )}
                  {isLoggedIn && !editing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => { setEditing(true); }}
                    >
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4 pb-8 px-8 space-y-8">
                {/* SERVINGS */}
                {editing ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Portionen</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={servings.amount}
                        onChange={(e) => {
                          setServings((s) => ({ ...s, amount: Number(e.target.value) }));
                        }}
                        className="w-24"
                        placeholder="Menge"
                      />
                      <Input
                        value={servings.type}
                        onChange={(e) => {
                          setServings((s) => ({ ...s, type: e.target.value }));
                        }}
                        placeholder="z.B. Personen"
                      />
                    </div>
                  </div>
                ) : recipe.servings ? (
                  <div className="flex justify-center">
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium"
                    >
                      <Users className="h-3.5 w-3.5" />
                      {recipe.servings.amount} {recipe.servings.type}
                    </Badge>
                  </div>
                ) : null}

                {/* INGREDIENTS */}
                {editing ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Zutaten</p>
                    <div className="space-y-2">
                      {ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input
                            value={ing.quantity ?? ""}
                            onChange={(e) => { updateIngredient(i, "quantity", e.target.value); }}
                            placeholder="Menge"
                            className="w-20"
                            type="number"
                          />
                          <Input
                            value={ing.unit ?? ""}
                            onChange={(e) => { updateIngredient(i, "unit", e.target.value); }}
                            placeholder="Einheit"
                            className="w-24"
                          />
                          <Input
                            value={ing.item}
                            onChange={(e) => { updateIngredient(i, "item", e.target.value); }}
                            placeholder="Zutat"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { removeIngredient(i); }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" onClick={addIngredient}>
                      + Zutat hinzufügen
                    </Button>
                  </div>
                ) : recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBasket className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        Zutaten
                      </h2>
                      <Separator className="flex-1" />
                    </div>
                    <ul className="divide-y divide-border/50">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="grid grid-cols-[3rem_5rem_1fr] gap-x-3 items-baseline py-2.5 first:pt-0 last:pb-0 text-base">
                          <span className="text-right tabular-nums text-sm font-medium text-foreground/80">
                            {ing.quantity ?? ""}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {ing.unit ?? ""}
                          </span>
                          <span className="text-base text-foreground">{ing.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* INSTRUCTIONS */}
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Zubereitung</p>
                      <Textarea
                        value={instructions}
                        onChange={(e) => { setInstructions(e.target.value); }}
                        rows={16}
                        className="font-sans text-base leading-relaxed"
                      />
                    </div>
                    {saveErr && (
                      <p className="text-sm text-destructive">{saveErr}</p>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={handleCancel} disabled={saving}>
                        Abbrechen
                      </Button>
                      <Button onClick={() => { void handleSave(); }} disabled={saving}>
                        {saving ? "Speichern…" : "Speichern"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        Zubereitung
                      </h2>
                      <Separator className="flex-1" />
                    </div>
                    <div className="rounded-xl bg-muted/20 border border-border/40 px-6 py-5">
                      <pre className="whitespace-pre-wrap font-sans text-base leading-[1.85] tracking-[0.01em] text-foreground/90">{instructions}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* LIGHTBOX */}
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => { setLightboxIndex(-1); }}
          slides={slides}
          plugins={[Zoom]}
        />
      </div>
    </Suspense>
  );
}
