"use client";

import type React from "react";
import NavBar from "@/components/nav-bar";
import { useI18n } from "@/components/language-provider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <>
      <NavBar />
      <main className="content-shell flex flex-col gap-6 py-5 md:py-7">{children}</main>
      <footer className="content-shell pb-8 text-xs leading-relaxed text-muted-foreground">{t("footerLine")}</footer>
    </>
  );
}
