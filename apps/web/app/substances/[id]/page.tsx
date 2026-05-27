"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/language-provider";

export default function SubstanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    params
      .then(async ({ id }) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/substances/${id}`,
          {
            cache: "no-store"
          }
        );

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
    return (
      <Card className="brand-panel">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="brand-panel">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </Card>
    );
  }

  const restricted = item.flags?.hasRestrictedCommercialSource;

  return (
    <div className="space-y-4">
      <Card className="brand-panel">
        <h2 className="text-xl font-bold">{item.primaryName}</h2>
        <p className="text-sm text-muted-foreground">{item.description || t("noDescription")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {restricted && <Badge>{t("restrictedLicense")}</Badge>}
          {item.identifiers?.inchikey && <Badge>InChIKey: {item.identifiers.inchikey}</Badge>}
        </div>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("masses")}</h3>
        <p>
          {t("detailMolecularWeight")}: {item.masses?.molecularWeight ?? t("na")}
        </p>
        <p>
          {t("detailExactMass")}: {item.masses?.exactMass ?? t("na")}
        </p>
        <p>
          {t("detailMonoisotopicMass")}: {item.masses?.monoisotopicMass ?? t("na")}
        </p>
        <p>
          {t("detailAverageMass")}: {item.masses?.averageMass ?? t("na")}
        </p>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("identifiers")}</h3>
        <p>PubChem CID: {item.identifiers?.pubchemCid ?? t("na")}</p>
        <p>ChEBI ID: {item.identifiers?.chebiId ?? t("na")}</p>
        <p>HMDB ID: {item.identifiers?.hmdbId ?? t("na")}</p>
        <p>SMILES: {item.identifiers?.smiles ?? t("na")}</p>
        <p>InChI: {item.identifiers?.inchi ?? t("na")}</p>
      </Card>

      <Card className="brand-panel space-y-2">
        <h3 className="font-semibold">{t("traceability")}</h3>
        {item.sources?.map((source: any) => (
          <div key={`${source.name}-${source.externalId}`} className="rounded border border-border p-2">
            <p>
              {source.name} / {source.externalId} / {source.licenseType}
            </p>
            {source.externalUrl && (
              <a className="text-primary underline" href={source.externalUrl} target="_blank" rel="noreferrer">
                {t("externalLink")}
              </a>
            )}
          </div>
        ))}
      </Card>

      <Card className="brand-panel">
        <p className="text-sm">{t("scientificWarning")}</p>
      </Card>
    </div>
  );
}
