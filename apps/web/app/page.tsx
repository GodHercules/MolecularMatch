"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Database,
  FlaskConical,
  Layers,
  Microscope,
  Network,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";
import Reveal from "@/components/reveal";
import StatusMessage from "@/components/status-message";

type StatsResponse = {
  totals?: {
    real?: number;
    pubchem?: number;
    chebi?: number;
    hmdb?: number;
  };
  latestImport?: {
    source?: string;
    startedAt?: string;
  };
};

type HealthResponse = {
  api?: string;
  database?: string;
};

function formatDate(date?: string, locale = "pt-BR") {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

export default function DashboardPage() {
  const { t, language } = useI18n();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, healthRes] = await Promise.all([api.get("/stats"), api.get("/health")]);
      setStats(statsRes.data.data ?? null);
      setHealth(healthRes.data.data ?? null);
    } catch (e: any) {
      setError(e?.message ?? t("dashboardError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const cards = useMemo(
    () => [
      { title: t("statReal"), value: stats?.totals?.real ?? 0, icon: Database },
      { title: t("statPubChem"), value: stats?.totals?.pubchem ?? 0, icon: Network },
      { title: t("statChebi"), value: stats?.totals?.chebi ?? 0, icon: Layers },
      { title: t("statHmdb"), value: stats?.totals?.hmdb ?? 0, icon: Microscope }
    ],
    [stats, t]
  );

  const sourceCards = [
    {
      name: "PubChem",
      description: t("sourcePubchemDesc"),
      count: stats?.totals?.pubchem ?? 0,
      icon: Network
    },
    {
      name: "ChEBI",
      description: t("sourceChebiDesc"),
      count: stats?.totals?.chebi ?? 0,
      icon: Layers
    },
    {
      name: "HMDB",
      description: t("sourceHmdbDesc"),
      count: stats?.totals?.hmdb ?? 0,
      icon: Microscope
    }
  ];

  const dataReady = (stats?.totals?.real ?? 0) > 0;

  return (
    <div className="space-y-5 md:space-y-6">
      <Reveal>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,_hsl(var(--brand-cyan))_0%,_transparent_70%)] opacity-35" />
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-3">
              <Badge className="w-fit">{t("landingBadge")}</Badge>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                {t("landingTitle")}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{t("landingSubtitle")}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link href="/search/single">
                  <Button className="w-full sm:w-auto">
                    <FlaskConical size={16} />
                    {t("landingCtaSingle")}
                  </Button>
                </Link>
                <Link href="/search/batch">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <UploadCloud size={16} />
                    {t("landingCtaBatch")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="surface-subtle rounded-2xl p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t("sourceStatus")}</p>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("apiStatus")}</span>
                  <Badge className="pill-status">{health?.api ?? "n/a"}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("dbStatus")}</span>
                  <Badge className="pill-status">{health?.database ?? "n/a"}</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t("latestImport")}</span>
                  <span className="text-right text-xs font-semibold">
                    {stats?.latestImport?.source ? `${stats.latestImport.source}` : t("none")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(stats?.latestImport?.startedAt, language === "pt-BR" ? "pt-BR" : "en-US")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-foreground/90">
            <p className="font-semibold">{t("landingDisclaimer")}</p>
            <p className="mt-1 text-muted-foreground">{t("landingTrust")}</p>
          </div>
        </Card>
      </Reveal>

      {error ? (
        <StatusMessage
          tone="network"
          title={t("networkErrorTitle")}
          description={`${t("networkErrorDescription")} (${error})`}
        />
      ) : null}

      <Reveal delayMs={80}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ title, value, icon: Icon }) => (
            <Card key={title}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{Number(value).toLocaleString()}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-muted/60">
                  <Icon size={18} />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="section-kicker">01. MolecularMatch</p>
              <h2 className="text-xl font-bold tracking-tight">
                {t("dashboardHeroTitleA")} <span className="brand-title">{t("dashboardHeroTitleB")}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboardHeroSubtitle")}</p>
            </div>
            {error ? (
              <Button type="button" variant="outline" onClick={() => load()}>
                {t("dashboardRetry")}
              </Button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {sourceCards.map(({ name, description, count, icon: Icon }) => (
              <div key={name} className="surface-subtle rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{name}</p>
                  <Icon size={16} className="text-muted-foreground" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                <p className="mt-3 text-lg font-bold">{Number(count).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal delayMs={170}>
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <h3 className="text-base font-semibold">{t("quickActionsTitle")}</h3>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                {
                  href: "/search/single",
                  title: t("quickActionSingleTitle"),
                  description: t("quickActionSingleDesc")
                },
                {
                  href: "/search/batch",
                  title: t("quickActionBatchTitle"),
                  description: t("quickActionBatchDesc")
                },
                {
                  href: "/admin",
                  title: t("quickActionAdminTitle"),
                  description: t("quickActionAdminDesc")
                }
              ].map((action) => (
                <Link key={action.href} href={action.href} className="surface-subtle rounded-xl p-3 hover:border-primary/40">
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {t("quickActionOpen")}
                    <ArrowRight size={13} />
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <h3 className="text-base font-semibold">{t("scientificNoticeTitle")}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("scientificNoticeText")}</p>
            {!dataReady && !loading ? (
              <StatusMessage tone="warning" title={t("statusAttention")} description={t("demoWarning")} className="mt-3" />
            ) : (
              <StatusMessage tone="success" title={t("statusOperational")} description={t("landingTrust")} className="mt-3" />
            )}
          </Card>
        </div>
      </Reveal>
    </div>
  );
}
