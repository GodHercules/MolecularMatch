"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchesToCsv, MatchResult } from "@molecular-match/shared";
import SearchResultsTable from "@/components/search-results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";

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
      <Card className="brand-panel space-y-3">
        <p className="section-kicker">05. {t("batchTitle")}</p>
        <h2 className="text-lg font-semibold">{t("batchTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("scientificWarning")}</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-xs">{t("massListLabel")}</label>
          <Textarea rows={8} {...form.register("massesText")} />
          <Input type="file" accept=".csv,.txt" onChange={onFile} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="text-xs">{t("massType")}</label>
              <Select {...form.register("massType")}>
                <option value="auto">auto</option>
                <option value="molecularWeight">molecularWeight</option>
                <option value="exactMass">exactMass</option>
                <option value="monoisotopicMass">monoisotopicMass</option>
                <option value="averageMass">averageMass</option>
              </Select>
            </div>
            <div>
              <label className="text-xs">{t("tolerance")}</label>
              <Input type="number" step="any" {...form.register("toleranceValue")} />
            </div>
            <div>
              <label className="text-xs">{t("toleranceType")}</label>
              <Select {...form.register("toleranceType")}>
                <option value="da">da</option>
                <option value="ppm">ppm</option>
                <option value="percent">percent</option>
              </Select>
            </div>
            <div>
              <label className="text-xs">{t("limitPerMass")}</label>
              <Input type="number" {...form.register("limitPerMass")} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("processing") : t("processBatch")}
            </Button>
            <Button type="button" variant="outline" onClick={exportCsv} disabled={!items.length}>
              {t("exportCsv")}
            </Button>
          </div>
        </form>

        {invalidCount > 0 && (
          <p className="text-sm text-warning">
            {invalidCount} {t("invalidEntries")}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      <div className="space-y-4">
        {groups.map(([mass, rows]) => (
          <Card key={mass} className="brand-panel">
            <h3 className="mb-2 font-semibold">
              {t("massGroup")} {mass}
            </h3>
            <SearchResultsTable items={rows} />
          </Card>
        ))}
      </div>
    </div>
  );
}
