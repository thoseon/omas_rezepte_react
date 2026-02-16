// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar.server";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omas Rezepte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geistSans.variable}>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen>
            <div className="h-svh overflow-hidden">
              <div className="flex h-svh w-full min-w-0">
                <Suspense fallback={<div className="p-3 text-sm">Lade Sidebar…</div>}>
                  <AppSidebar />
                </Suspense>

                <SidebarInset className="flex min-w-0 flex-1 flex-col">
                  <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
                    <div className="p-2">
                      <SidebarTrigger />
                    </div>
                  </header>

                  <main className="flex-1 min-w-0 overflow-auto">
                    <div className="p-6 min-w-0">{children}</div>
                  </main>
                </SidebarInset>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
