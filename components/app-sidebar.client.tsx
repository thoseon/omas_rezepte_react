"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, BookOpen, Search } from "lucide-react";
import type { RecipeNavItem } from "./app-sidebar.server";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type RecipeHit = { id: number; title: string };

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
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

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Search failed");
        setRemote(json.recipes ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message ?? "Search failed");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [dq]);

  const list: RecipeHit[] = remote ?? recipes;

  return (
    <Sidebar variant="inset" collapsible="none">
      <SidebarHeader className="space-y-3">
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">Omas Rezepte</span>
            <span className="text-xs text-muted-foreground">Sammlung</span>
          </div>
        </Link>

        <div className="relative px-2">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche…"
            className="pl-9"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                ALLE
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
                    list.map((r) => (
                      <SidebarMenuItem key={r.id}>
                        <SidebarMenuButton asChild>
                          <Link href={`/recipes/${r.id}`}>
                            <span>{r.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}

                  {!loading && err && (
                    <div className="px-2 py-3 text-sm text-destructive">
                      {err}
                    </div>
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
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
