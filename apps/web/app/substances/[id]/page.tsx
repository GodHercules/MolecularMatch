"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/language-provider";
import Reveal from "@/components/reveal";
import StatusMessage from "@/components/status-message";

export default function SubstanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    params
      .then(async ({ id }) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/substances/${id}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(t("detailLoadError"));
        }

        const data = await response.json();
        if (mounted) setItem(data.data);
      })
      .catch((e) => {
        if (mounted) setError(e?.message ?? t("detailLoadError"));
      });

    return () => {
      mounted = false;
    };
  }, [params, t]);

  if (error) {
    return <StatusMessage tone="network" title={t("networkErrorTitle")} description={`${t("networkErrorDescription")} (${error})`} />;
  }

  if (!item) {
    return <StatusMessage tone="info" title={t("loading")} />;
  }

  const restricted = item.flags?.hasRestrictedCommercialSource;

  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <p className="section-kicker">05. {t("detailTitle")}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{item.primaryName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{item.description || t("noDescription")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {restricted ? <Badge className="border-warning/50 bg-warning/12">{t("restrictedLicense")}</Badge> : null}
            {item.identifiers?.inchikey ? <Badge>InChIKey: {item.identifiers.inchikey}</Badge> : null}
          </div>
        </Card>
      </Reveal>

      <Reveal delayMs={60}>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="space-y-2">
            <h2 className="font-semibold">{t("masses")}</h2>
            <Metric label={t("massTypeMolecularWeight")} value={item.masses?.molecularWeight} fallback={t("na")} />
            <Metric label={t("massTypeExactMass")} value={item.masses?.exactMass} fallback={t("na")} />
            <Metric label={t("massTypeMonoisotopicMass")} value={item.masses?.monoisotopicMass} fallback={t("na")} />
            <Metric label={t("massTypeAverageMass")} value={item.masses?.averageMass} fallback={t("na")} />
          </Card>

          <Card className="space-y-2">
            <h2 className="font-semibold">{t("identifiers")}</h2>
            <Metric label="PubChem CID" value={item.identifiers?.pubchemCid} fallback={t("na")} />
            <Metric label="ChEBI ID" value={item.identifiers?.chebiId} fallback={t("na")} />
            <Metric label="HMDB ID" value={item.identifiers?.hmdbId} fallback={t("na")} />
            <Metric label="SMILES" value={item.identifiers?.smiles} fallback={t("na")} />
            <Metric label="InChI" value={item.identifiers?.inchi} fallback={t("na")} />
          </Card>
        </div>
      </Reveal>

      <Reveal delayMs={100}>
        <Card className="space-y-2">
          <h2 className="font-semibold">{t("traceability")}</h2>
          <div className="space-y-2">
            {item.sources?.map((source: any) => (
              <div key={`${source.name}-${source.externalId}`} className="surface-subtle rounded-xl p-3 text-sm">
                <p className="font-semibold">
                  {source.name} / {source.externalId}
                </p>
                <p className="text-xs text-muted-foreground">{source.licenseType}</p>
                {source.externalUrl ? (
                  <a className="mt-1 inline-block text-xs font-semibold text-primary hover:underline" href={source.externalUrl} target="_blank" rel="noreferrer">
                    {t("externalLink")}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal delayMs={140}>
        <StatusMessage tone="warning" title={t("scientificNoticeTitle")} description={t("detailScientificNote")} />
      </Reveal>
    </div>
  );
}

function Metric({ label, value, fallback }: { label: string; value?: string | number | null; fallback: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/45 py-1.5 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold">{value ?? fallback}</span>
    </div>
  );
}
