// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar.server";
import { AppHeader } from "@/components/app-header";
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

export default function RootLayout({ children }: { children: React.ReactNode } ) {
  return (
    <html lang="de" className={geistSans.variable} suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen>
            <Suspense fallback={<div className="p-3 text-sm">Lade Sidebar…</div>}>
              <AppSidebar />
            </Suspense>
            <SidebarInset className="flex min-w-0 flex-1 flex-col">
              <Suspense fallback={<div className="h-12 border-b" />}>
                <AppHeader />
              </Suspense>
              <main className="flex-1 min-w-0 overflow-auto bg-background">
                <div className="p-6 min-w-0">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
