import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { AppSidebarClient } from "./app-sidebar.client";

export type RecipeNavItem = {
  id: number;
  title: string;
};

export async function AppSidebar() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("recipes")
    .select("id, title")
    .order("title", { ascending: true });

  const recipes: RecipeNavItem[] = (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
  }));

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
      </SidebarHeader>

      <AppSidebarClient recipes={recipes} />

      <SidebarFooter />
    </Sidebar>
  );
}
