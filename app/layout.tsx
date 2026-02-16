// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar.server";
import { Suspense } from "react";
import "./globals.css";
import { Separator } from "@/components/ui/separator"

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
                    <SidebarInset className="flex min-w-0 flex-1 flex-col">
                        <main className="flex-1 min-w-0 overflow-auto bg-background">
                        <div className="p-6 min-w-0">{children}</div>
                        </main>
                    </SidebarInset>
                </Suspense>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
