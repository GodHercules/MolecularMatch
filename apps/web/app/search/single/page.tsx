"use client";

import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlaskConical, SlidersHorizontal } from "lucide-react";
import { matchesToCsv, MatchResult } from "@/lib/match";
import SearchResultsTable from "@/components/search-results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";
import Reveal from "@/components/reveal";
import StatusMessage from "@/components/status-message";

const schema = z.object({
  mass: z.coerce.number().positive(),
  massType: z.enum(["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"]),
  toleranceType: z.enum(["da", "ppm", "percent"]),
  toleranceValue: z.coerce.number().positive(),
  limitPerMass: z.coerce.number().int().min(1).max(200),
  includeRestrictedSources: z.boolean().default(false)
});

type FormData = z.infer<typeof schema>;

export default function SingleSearchPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      massType: "auto",
      toleranceType: "ppm",
      toleranceValue: 10,
      limitPerMass: 25,
      includeRestrictedSources: false
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/search/single", {
        ...values,
        appMode: "internal_test"
      });
      setItems(res.data.data.items ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? t("searchError"));
    } finally {
      setLoading(false);
    }
  });

  const exportCsv = () => {
    const csv = matchesToCsv(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "molecularmatch-single-search.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-kicker">02. {t("singleTitle")}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{t("singleTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("singleSubtitle")}</p>
            </div>
            <BadgeInfo text={t("searchGuide")} />
          </div>

          <form className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={onSubmit}>
            <Field label={t("molecularWeightInput")} htmlFor="mass">
              <Input id="mass" type="number" step="any" {...form.register("mass")} />
            </Field>

            <Field label={t("massType")} htmlFor="massType">
              <Select id="massType" {...form.register("massType")}>
                <option value="auto">{t("massTypeAuto")}</option>
                <option value="molecularWeight">{t("massTypeMolecularWeight")}</option>
                <option value="exactMass">{t("massTypeExactMass")}</option>
                <option value="monoisotopicMass">{t("massTypeMonoisotopicMass")}</option>
                <option value="averageMass">{t("massTypeAverageMass")}</option>
              </Select>
            </Field>

            <Field label={t("tolerance")} htmlFor="toleranceValue">
              <Input id="toleranceValue" type="number" step="any" {...form.register("toleranceValue")} />
            </Field>

            <Field label={t("toleranceType")} htmlFor="toleranceType">
              <Select id="toleranceType" {...form.register("toleranceType")}>
                <option value="da">{t("toleranceDa")}</option>
                <option value="ppm">{t("tolerancePpm")}</option>
                <option value="percent">{t("tolerancePercent")}</option>
              </Select>
            </Field>

            <Field label={t("resultLimit")} htmlFor="limitPerMass">
              <Input id="limitPerMass" type="number" {...form.register("limitPerMass")} />
            </Field>

            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 text-sm">
              <input type="checkbox" className="h-4 w-4" {...form.register("includeRestrictedSources")} />
              {t("includeRestricted")}
            </label>

            <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={loading}>
                <FlaskConical size={16} />
                {loading ? t("searching") : t("search")}
              </Button>
              <Button type="button" variant="outline" onClick={exportCsv} disabled={!items.length}>
                {t("exportCsv")}
              </Button>
            </div>
          </form>

          <StatusMessage tone="warning" title={t("scientificNoticeTitle")} description={t("scientificNoticeText")} />
          {error ? (
            <StatusMessage tone="network" title={t("networkErrorTitle")} description={`${t("networkErrorDescription")} (${error})`} />
          ) : null}
        </Card>
      </Reveal>

      <Reveal delayMs={90}>
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <h2 className="font-semibold">{t("candidates")}</h2>
          </div>
          <SearchResultsTable items={items} />
        </Card>
      </Reveal>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function BadgeInfo({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
      <FlaskConical size={13} />
      {text}
    </span>
  );
}
