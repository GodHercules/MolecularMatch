"use client";

import Link from "next/link";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { MatchResult } from "@/lib/match";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { useI18n } from "@/components/language-provider";
import StatusMessage from "@/components/status-message";
import { cn } from "@/lib/utils";

const helper = createColumnHelper<MatchResult>();

const confidenceTone: Record<MatchResult["confidenceLevel"], string> = {
  HIGH_COMPATIBILITY: "border-success/50 bg-success/12",
  MODERATE_COMPATIBILITY: "border-primary/35 bg-primary/10",
  POSSIBLE_COMPATIBILITY: "border-warning/45 bg-warning/14",
  INCONCLUSIVE: "border-border bg-muted/65"
};

export default function SearchResultsTable({ items }: { items: MatchResult[] }) {
  const { t } = useI18n();
  const columns = useMemo(
    () => [
      helper.accessor("primaryName", {
        header: t("tableName"),
        cell: (ctx) => (
          <Link className="font-semibold text-primary hover:underline" href={`/substances/${ctx.row.original.substanceId}`}>
            {ctx.getValue()}
          </Link>
        )
      }),
      helper.accessor("molecularFormula", {
        header: t("tableFormula"),
        cell: (ctx) => <span className="font-mono text-xs uppercase">{ctx.getValue() || t("na")}</span>
      }),
      helper.accessor("matchedMassType", { header: t("tableType") }),
      helper.accessor("matchedMassValue", {
        header: t("tableMass"),
        cell: (ctx) => Number(ctx.getValue()).toFixed(6)
      }),
      helper.accessor("absoluteDifference", {
        header: t("tableDa"),
        cell: (ctx) => Number(ctx.getValue()).toExponential(2)
      }),
      helper.accessor("ppmDifference", {
        header: t("tablePpm"),
        cell: (ctx) => Number(ctx.getValue()).toFixed(2)
      }),
      helper.accessor("confidenceLevel", {
        header: t("tableConfidence"),
        cell: (ctx) => <Badge className={cn(confidenceTone[ctx.getValue()])}>{ctx.getValue().replaceAll("_", " ")}</Badge>
      })
    ],
    [t]
  );

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });

  if (!items.length) {
    return (
      <StatusMessage
        title={t("emptyResultsTitle")}
        description={t("emptyResultsDescription")}
        tone="info"
        className="border-dashed"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60">
      <Table>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <Th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-card/48">
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
