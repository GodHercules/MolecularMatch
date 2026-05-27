"use client";

import type React from "react";
import NavBar from "@/components/nav-bar";
import { useI18n } from "@/components/language-provider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <>
      <NavBar />
      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs leading-relaxed text-muted-foreground">
        {t("scientificWarning")}
      </footer>
    </>
  );
}
