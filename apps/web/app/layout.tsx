import type { Metadata } from "next";
import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "MolecularMatch",
  description: "Consulta de candidatos compativeis por massa molecular"
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

