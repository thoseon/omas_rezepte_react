"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import type { RecipeNavItem } from "./app-sidebar.server";

type RecipeHit = { id: number; title: string, category:string };

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => { setV(value); }, ms);
    return () => { clearTimeout(t); };
  }, [value, ms]);
  return v;
}

export function AppSidebarClient({ recipes }: { recipes: RecipeNavItem[] }) {
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q, 250);

  const [remote, setRemote] = React.useState<RecipeHit[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    const query = dq.trim();
    setErr(null);

    if (!query) {
      setRemote(null);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const json = await res.json() as { error?: string; recipes?: RecipeHit[] };
        if (!res.ok) throw new Error(json.error ?? "Search failed");
        setRemote(json.recipes ?? []);
      } catch (e: unknown) {
        const isAbort = e instanceof Error && e.name === "AbortError";
        if (!isAbort) setErr(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    })();

    return () => { controller.abort(); };
  }, [dq]);

  const recipeList: RecipeHit[] = remote ?? recipes;
  const recipesByCategory = Object.groupBy(recipeList, ({category}) => category);

  return (
    <>
      <div className="relative px-4 pb-2">
        <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); }}
          placeholder="Suche…"
          className="pl-9"
        />
      </div>

     <SidebarContent>
{Object.entries(recipesByCategory).map(([category, recipes = []]) => (
    <Collapsible key={category} defaultOpen={remote !== null} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            {category}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading && (
                <div className="px-2 py-2 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-[85%]" />
                  <Skeleton className="h-6 w-[70%]" />
                </div>
              )}
              {!loading &&
                recipes.map((r) => (
                  <SidebarMenuItem key={r.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/recipes/${r.id.toString()}`}>
                        <span className="truncate">{r.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {!loading && err && (
                <div className="px-2 py-3 text-sm text-destructive">{err}</div>
              )}
              {!loading && !err && dq.trim() && (remote?.length ?? 0) === 0 && (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  Keine Treffer
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  ))}
</SidebarContent>
    </>
  );
}
