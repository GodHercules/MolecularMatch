"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Language, useI18n } from "@/components/language-provider";

function FlagPill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${
        active
          ? "border-primary bg-[linear-gradient(90deg,hsla(var(--brand-blue-strong),0.2),hsla(var(--brand-cyan),0.22))] text-foreground shadow-[0_8px_16px_-12px_hsl(var(--brand-blue))]"
          : "border-border bg-card/45 text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

export default function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  const set = (next: Language) => setLanguage(next);

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card/75 p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => set("pt-BR")}
        className="h-8 px-2"
        aria-label={t("langPt")}
        title={t("langPt")}
      >
        <FlagPill active={language === "pt-BR"}>🇧🇷 PT</FlagPill>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => set("en-US")}
        className="h-8 px-2"
        aria-label={t("langEn")}
        title={t("langEn")}
      >
        <FlagPill active={language === "en-US"}>🇺🇸 EN</FlagPill>
      </Button>
    </div>
  );
}
