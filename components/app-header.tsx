import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";

import { LogoutButton } from "./logout-button";

export async function AppHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-muted-foreground">{user.email}</span>
            <Separator orientation="vertical" className="h-4" />
            <LogoutButton />
          </>
        ) : (
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Anmelden
          </Link>
        )}
      </div>
    </header>
  );
}
