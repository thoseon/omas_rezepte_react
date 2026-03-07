"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(recipe.title);
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
      .update({ title, instructions, servings, ingredients })
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

  function prevImage() {
    setFullscreenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }

  function nextImage() {
    setFullscreenIndex((i) =>
      i !== null && i < imageUrls.length - 1 ? i + 1 : i
    );
  }

  useEffect(() => {
    if (fullscreenIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreenIndex(null);
      if (e.key === "ArrowLeft") setFullscreenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight") setFullscreenIndex((i) => (i !== null && i < imageUrls.length - 1 ? i + 1 : i));
    }
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [fullscreenIndex, imageUrls.length]);

  const fullscreenUrl =
    fullscreenIndex !== null ? (imageUrls[fullscreenIndex]?.url ?? null) : null;

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
            <Card className="rounded-2xl border bg-background/85 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  {editing ? (
                    <Input
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); }}
                      className="text-2xl font-semibold flex-1"
                    />
                  ) : (
                    <CardTitle className="text-4xl font-semibold text-center flex-1">
                      {title}
                    </CardTitle>
                  )}
                  {isLoggedIn && !editing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditing(true); }}
                    >
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-6">
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
                  <div className="flex items-center gap-2 text-base">
                    <span className="font-medium">Portionen:</span>
                    <span>{recipe.servings.amount} {recipe.servings.type}</span>
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Zutaten</p>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex gap-2 text-base">
                          {ing.quantity !== null && (
                            <span className="w-10 text-right tabular-nums">{ing.quantity}</span>
                          )}
                          {ing.unit && (
                            <span className="w-14 text-muted-foreground">{ing.unit}</span>
                          )}
                          <span>{ing.item}</span>
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Zubereitung</p>
                    <div className="rounded-xl border bg-muted/30 p-6 text-base leading-relaxed">
                      <pre className="whitespace-pre-wrap font-sans">{instructions}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ORIGINAL PAGES GALLERY */}
            {imageUrls.length > 0 && (
              <Card className="rounded-2xl border bg-background/85 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-muted-foreground">
                    Originalseiten ({imageUrls.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {imageUrls.map((img, i) => (
                      <button
                        key={img.path}
                        type="button"
                        aria-label={`Seite ${String(i + 1)} vergrößern`}
                        className="relative h-36 w-28 cursor-zoom-in overflow-hidden rounded-lg border bg-muted shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
                        onClick={() => { setFullscreenIndex(i); }}
                      >
                        <Image
                          src={img.url}
                          alt={`Seite ${String(i + 1)}`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 py-0.5 text-center text-xs text-white">
                          {i + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* FULLSCREEN OVERLAY */}
        {fullscreenUrl !== null && fullscreenIndex !== null ? (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-black/90"
            onClick={() => { setFullscreenIndex(null); }}
          >
            {/* TOP BAR */}
            <div
              className="flex shrink-0 items-center justify-between px-4 py-3"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <span className="text-sm text-white/70">
                {fullscreenIndex + 1} / {imageUrls.length}
              </span>
              <button
                type="button"
                aria-label="Schließen"
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                onClick={() => { setFullscreenIndex(null); }}
              >
                Schließen
              </button>
            </div>

            {/* IMAGE */}
            <div
              className="relative min-h-0 flex-1"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Image
                src={fullscreenUrl}
                alt={`Seite ${String(fullscreenIndex + 1)}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* PREV / NEXT */}
            <div
              className="flex shrink-0 items-center justify-center gap-4 py-4"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={fullscreenIndex === 0}
                onClick={prevImage}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-30"
              >
                ← Zurück
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={fullscreenIndex === imageUrls.length - 1}
                onClick={nextImage}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 disabled:opacity-30"
              >
                Weiter →
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Suspense>
  );
}
