import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ recipes: [] });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("id,title,category")
    .textSearch("search", q, { type: "websearch", config: "german" })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ recipes: data ?? [] });
}
