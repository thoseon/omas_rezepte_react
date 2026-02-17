"use client";

import Image from "next/image";
import { Suspense, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecipeRow = {
  id: number;
  title: string;
  text: string;
  pages: string[];
};

export default function RecipeClient({
  recipe,
  imageUrls,
}: {
  recipe: RecipeRow;
  imageUrls: { path: string; url: string }[];
}) {
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  const backgroundUrl = imageUrls[0]?.url ?? "";

  return (
    <Suspense fallback={<div className="p-6">Lade Rezept…</div>}>
      <div className="relative min-h-screen w-full">
        {/* CLICKABLE BACKGROUND */}
        <button
          type="button"
          aria-label="Open background image fullscreen"
          className="absolute inset-0 z-0 block cursor-zoom-in"
          onClick={() => {
            if (backgroundUrl) setFullscreen(backgroundUrl);
          }}
        >
          {/* The actual background image */}
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

          {/* Keep your overlays */}
          <div className="absolute inset-0 bg-white/65" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </button>

        {/* CONTENT ABOVE BACKGROUND */}
        <main className="relative z-10 min-h-screen px-6 pt-6 pb-10 md:px-10">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <Card className="rounded-2xl border bg-background/85 backdrop-blur-md">
              <CardHeader className="pb-4 text-center">
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

        {/* FULLSCREEN OVERLAY */}
        {fullscreen ? (
          <div
            className="fixed inset-0 z-50 bg-black/80 p-6"
            onClick={() => { setFullscreen(null); }}
          >
            <div
              className="relative mx-auto h-full max-w-5xl cursor-zoom-out"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <button
                type="button"
                aria-label="Close fullscreen"
                className="absolute right-2 top-2 z-10 rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                onClick={() => { setFullscreen(null); }}
              >
                Close
              </button>

              <Image
                src={fullscreen}
                alt=""
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>
    </Suspense>
  );
}
