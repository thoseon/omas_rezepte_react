// app/(auth)/layout.tsx
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", display: "swap", subsets: ["latin"] });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
