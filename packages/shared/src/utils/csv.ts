import { MatchResult } from "../types";

export function matchesToCsv(results: MatchResult[]): string {
  const header = [
    "searchedMass",
    "substanceId",
    "primaryName",
    "molecularFormula",
    "matchedMassType",
    "matchedMassValue",
    "absoluteDifference",
    "ppmDifference",
    "confidenceLevel",
    "confidenceScore",
    "sources"
  ];

  const rows = results.map((r) =>
    [
      r.searchedMass,
      r.substanceId,
      r.primaryName,
      r.molecularFormula ?? "",
      r.matchedMassType,
      r.matchedMassValue,
      r.absoluteDifference,
      r.ppmDifference,
      r.confidenceLevel,
      r.confidenceScore,
      r.sources.map((s) => `${s.name}:${s.externalId}`).join("|")
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

