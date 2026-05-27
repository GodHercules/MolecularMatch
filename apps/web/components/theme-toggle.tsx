"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/language-provider";

const THEME_KEY = "molecularmatch-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const nextTheme: Theme = saved ?? "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setMounted(true);
  }, []);

  const toggle = () => {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  if (!mounted) {
    return <div className="h-9 w-24 rounded-md border border-border bg-card" />;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      className="h-10 rounded-xl border-primary/30 bg-card/75 px-3 text-[0.78rem] font-semibold uppercase tracking-wide"
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {theme === "dark" ? t("themeLight") : t("themeDark")}
    </Button>
  );
}
