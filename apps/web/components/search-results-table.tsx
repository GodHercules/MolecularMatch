"use client";

import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMemo } from "react";
import { MatchResult } from "@/lib/match";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { useI18n } from "@/components/language-provider";

const helper = createColumnHelper<MatchResult>();

export default function SearchResultsTable({ items }: { items: MatchResult[] }) {
  const { t } = useI18n();
  const columns = useMemo(
    () => [
      helper.accessor("primaryName", {
        header: t("tableName"),
        cell: (ctx) => (
          <Link className="text-primary underline" href={`/substances/${ctx.row.original.substanceId}`}>
            {ctx.getValue()}
          </Link>
        )
      }),
      helper.accessor("molecularFormula", { header: t("tableFormula") }),
      helper.accessor("matchedMassType", { header: t("tableType") }),
      helper.accessor("matchedMassValue", { header: t("tableMass") }),
      helper.accessor("absoluteDifference", { header: t("tableDa") }),
      helper.accessor("ppmDifference", { header: t("tablePpm") }),
      helper.accessor("confidenceLevel", {
        header: t("tableConfidence"),
        cell: (ctx) => <Badge>{ctx.getValue()}</Badge>
      })
    ],
    [t]
  );

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto">
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
            <tr key={row.id}>
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

