import type { Metadata } from "next";
import type React from "react";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "MolecularMatch",
  description: "Scientific candidate matching by molecular mass"
};

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${manrope.variable} ${plexMono.variable}`}>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
