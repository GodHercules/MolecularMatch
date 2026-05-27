"use client";

import { useEffect, useState } from "react";
import { Microscope, Network, Search, ShieldCheck, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/stats"), api.get("/health")])
      .then(([statsRes, healthRes]) => {
        setStats(statsRes.data.data);
        setHealth(healthRes.data.data);
      })
      .catch((e) => {
        setError(e?.message ?? t("dashboardError"));
      });
  }, [t]);

  const cards = [
    [t("statReal"), stats?.totals?.real ?? 0],
    [t("statPubChem"), stats?.totals?.pubchem ?? 0],
    [t("statChebi"), stats?.totals?.chebi ?? 0],
    [t("statHmdb"), stats?.totals?.hmdb ?? 0]
  ];

  const palette = ["#0A1F4D", "#1048B6", "#0DB0C9", "#00D6C2", "#BDE3F2", "#F3F7FA"];
  const keywords = [
    { icon: Target, label: t("keywordPrecision") },
    { icon: Microscope, label: t("keywordScience") },
    { icon: Network, label: t("keywordMatching") },
    { icon: Search, label: t("keywordDiscovery") },
    { icon: ShieldCheck, label: t("keywordTrust") }
  ];

  return (
    <div className="space-y-4">
      <Card className="brand-panel relative overflow-hidden">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,_hsl(var(--brand-cyan))_0%,_transparent_70%)] opacity-30" />
        <p className="section-kicker">01. MolecularMatch</p>
        <h2 className="text-2xl font-semibold">
          {t("dashboardHeroTitleA")} <span className="brand-title">{t("dashboardHeroTitleB")}</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("dashboardHeroSubtitle")}</p>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {cards.map(([title, value]) => (
          <Card key={String(title)} className="brand-panel">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{String(value)}</p>
          </Card>
        ))}
      </div>

      <Card className="brand-panel space-y-2">
        <div className="flex gap-2">
          <Badge>
            {t("apiStatus")}: {health?.api ?? "n/a"}
          </Badge>
          <Badge>
            {t("dbStatus")}: {health?.database ?? "n/a"}
          </Badge>
        </div>
        <p className="text-sm">
          {t("latestImport")}: {stats?.latestImport?.source ?? t("none")}
        </p>
        {stats?.totals?.real === 0 && (
          <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm">{t("demoWarning")}</p>
        )}
        <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm">{t("scientificWarning")}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="brand-panel">
          <p className="section-kicker">02. {t("brandPalette")}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {palette.map((hex) => (
              <div key={hex} className="space-y-1">
                <div className="h-12 rounded-xl border border-border" style={{ backgroundColor: hex }} />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{hex}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="brand-panel">
          <p className="section-kicker">03. {t("brandKeywords")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {keywords.map(({ icon: Icon, label }) => (
              <div key={label} className="brand-chip flex items-center gap-2 rounded-xl px-3 py-2">
                <Icon size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
