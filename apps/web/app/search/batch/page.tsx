"use client";

import type React from "react";
import { ChangeEvent, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Files, Upload } from "lucide-react";
import { matchesToCsv, MatchResult } from "@/lib/match";
import SearchResultsTable from "@/components/search-results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";
import Reveal from "@/components/reveal";
import StatusMessage from "@/components/status-message";

const schema = z.object({
  massesText: z.string().min(1),
  massType: z.enum(["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"]),
  toleranceType: z.enum(["da", "ppm", "percent"]),
  toleranceValue: z.coerce.number().positive(),
  limitPerMass: z.coerce.number().int().min(1).max(200)
});

type FormData = z.infer<typeof schema>;

function parseMasses(input: string): number[] {
  return input
    .split(/[\s,;\n\r\t]+/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export default function BatchSearchPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MatchResult[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      massType: "auto",
      toleranceType: "ppm",
      toleranceValue: 10,
      limitPerMass: 25,
      massesText: ""
    }
  });

  const groups = useMemo(() => {
    const map = new Map<number, MatchResult[]>();
    for (const item of items) {
      const arr = map.get(item.searchedMass) ?? [];
      arr.push(item);
      map.set(item.searchedMass, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    form.setValue("massesText", text);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const raw = values.massesText.split(/[\s,;\n\r\t]+/).filter(Boolean);
    const masses = parseMasses(values.massesText);
    setInvalidCount(Math.max(raw.length - masses.length, 0));

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/search/batch", {
        masses,
        massType: values.massType,
        toleranceType: values.toleranceType,
        toleranceValue: values.toleranceValue,
        limitPerMass: values.limitPerMass,
        includeRestrictedSources: false,
        appMode: "internal_test"
      });
      setItems(res.data.data.items ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? t("batchError"));
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
    link.download = "molecularmatch-batch-search.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="space-y-4">
          <div>
            <p className="section-kicker">03. {t("batchTitle")}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{t("batchTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("batchSubtitle")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <Field label={t("massListLabel")} htmlFor="massesText">
              <Textarea id="massesText" rows={8} {...form.register("massesText")} />
            </Field>

            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
              <Field label={t("uploadHint")} htmlFor="massFile">
                <Input id="massFile" type="file" accept=".csv,.txt" onChange={onFile} />
              </Field>
              <Button type="button" variant="outline" onClick={exportCsv} disabled={!items.length}>
                <Upload size={15} />
                {t("exportCsv")}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              <Field label={t("limitPerMass")} htmlFor="limitPerMass">
                <Input id="limitPerMass" type="number" {...form.register("limitPerMass")} />
              </Field>
            </div>

            <Button type="submit" disabled={loading}>
              <Files size={16} />
              {loading ? t("processing") : t("processBatch")}
            </Button>
          </form>

          {invalidCount > 0 ? (
            <StatusMessage tone="warning" title={`${invalidCount} ${t("invalidEntries")}`} description={t("searchGuide")} />
          ) : null}
          {error ? (
            <StatusMessage tone="network" title={t("networkErrorTitle")} description={`${t("networkErrorDescription")} (${error})`} />
          ) : null}
        </Card>
      </Reveal>

      <div className="space-y-4">
        {groups.map(([mass, rows], index) => (
          <Reveal key={mass} delayMs={Math.min(index * 40, 220)}>
            <Card>
              <h2 className="mb-3 text-base font-semibold">
                {t("massGroup")} {mass}
              </h2>
              <SearchResultsTable items={rows} />
            </Card>
          </Reveal>
        ))}
      </div>
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
