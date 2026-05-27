import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import LanguageToggle from "@/components/language-toggle";
import { useI18n } from "@/components/language-provider";

export default function NavBar() {
  const { t } = useI18n();
  const items = [
    { href: "/", label: t("navDashboard") },
    { href: "/search/single", label: t("navSingle") },
    { href: "/search/batch", label: t("navBatch") },
    { href: "/admin", label: t("navAdmin") }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/molecularmatch-logo.png"
            alt="MolecularMatch logo"
            width={48}
            height={48}
            className="h-10 w-10 rounded-md object-contain"
            priority
          />
          <div>
            <h1 className="brand-title text-xl font-bold">MolecularMatch</h1>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

