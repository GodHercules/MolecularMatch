"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { matchesToCsv, MatchResult } from "@molecular-match/shared";
import SearchResultsTable from "@/components/search-results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useI18n } from "@/components/language-provider";

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
      <Card className="brand-panel space-y-3">
        <p className="section-kicker">04. {t("singleTitle")}</p>
        <h2 className="text-lg font-semibold">{t("singleTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("scientificWarning")}</p>

        <form className="grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={onSubmit}>
          <div>
            <label className="text-xs">{t("molecularWeightInput")}</label>
            <Input type="number" step="any" {...form.register("mass")} />
          </div>
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
            <label className="text-xs">{t("resultLimit")}</label>
            <Input type="number" {...form.register("limitPerMass")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("includeRestrictedSources")} />
            {t("includeRestricted")}
          </label>
          <div className="md:col-span-3 flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("searching") : t("search")}
            </Button>
            <Button type="button" variant="outline" onClick={exportCsv} disabled={!items.length}>
              {t("exportCsv")}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      <Card className="brand-panel">
        <h3 className="mb-3 font-semibold">{t("candidates")}</h3>
        <SearchResultsTable items={items} />
      </Card>
    </div>
  );
}
