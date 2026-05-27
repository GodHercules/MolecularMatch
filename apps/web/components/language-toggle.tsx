"use client";

import { Button } from "@/components/ui/button";
import { Language, useI18n } from "@/components/language-provider";
import { cn } from "@/lib/utils";

function LangPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-14 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        active
          ? "border-primary/60 bg-[linear-gradient(90deg,hsla(var(--brand-blue-strong),0.2),hsla(var(--brand-cyan),0.22))] text-foreground"
          : "border-border bg-card/55 text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export default function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  const set = (next: Language) => setLanguage(next);

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-card/70 p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => set("pt-BR")}
        className="h-8 px-2"
        aria-label={t("langPt")}
        title={t("langPt")}
      >
        <LangPill active={language === "pt-BR"} label="PT-BR" />
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
        <LangPill active={language === "en-US"} label="EN-US" />
      </Button>
    </div>
  );
}
