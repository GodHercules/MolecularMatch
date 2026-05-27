"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FlaskConical, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/language-provider";

export default function NavBar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { href: "/", label: t("navDashboard") },
      { href: "/search/single", label: t("navSingle") },
      { href: "/search/batch", label: t("navBatch") },
      { href: "/admin", label: t("navAdmin") }
    ],
    [t]
  );

  const navLinks = (
    <>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-semibold",
              active
                ? "bg-[linear-gradient(90deg,hsla(var(--brand-blue-strong),0.14),hsla(var(--brand-cyan),0.18))] text-foreground shadow-[0_10px_20px_-18px_hsl(var(--brand-blue))]"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-lg">
      <div className="content-shell flex min-h-[4.5rem] items-center gap-3 py-3">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="MolecularMatch home">
          <div className="relative">
            <Image
              src="/molecularmatch-logo.png"
              alt="MolecularMatch logo"
              width={48}
              height={48}
              className="h-11 w-11 rounded-xl border border-border/70 bg-card/80 p-1 object-contain"
              priority
            />
            <span className="absolute -bottom-1 -right-1 inline-flex h-3 w-3 rounded-full bg-success" />
          </div>
          <div className="min-w-0">
            <p className="brand-title truncate text-xl font-extrabold tracking-tight">MolecularMatch</p>
            <p className="truncate text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">{t("tagline")}</p>
          </div>
        </Link>

        <div className="ml-auto hidden items-center gap-1 lg:flex">{navLinks}</div>

        <div className="ml-auto hidden items-center gap-2 sm:flex lg:ml-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/search/single">
            <Button size="sm" className="h-10 px-3">
              <FlaskConical size={14} />
              {t("landingCtaSingle")}
            </Button>
          </Link>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto h-10 w-10 p-0 sm:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? t("navCloseMenu") : t("navOpenMenu")}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border/70 bg-card/95 px-3 pb-3 pt-2 sm:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="mb-3 grid gap-1">{navLinks}</div>
        <div className="grid gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/search/single" onClick={() => setOpen(false)}>
            <Button className="h-10 w-full justify-center" size="sm">
              <FlaskConical size={14} />
              {t("landingCtaSingle")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
