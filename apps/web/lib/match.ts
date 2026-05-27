export type LicenseType = "open" | "restricted_commercial_use" | "unknown";

export type ConfidenceLevel =
  | "HIGH_COMPATIBILITY"
  | "MODERATE_COMPATIBILITY"
  | "POSSIBLE_COMPATIBILITY"
  | "INCONCLUSIVE";

export interface MatchResult {
  searchedMass: number;
  substanceId: string;
  primaryName: string;
  molecularFormula?: string;
  matchedMassType: "molecularWeight" | "exactMass" | "monoisotopicMass" | "averageMass";
  matchedMassValue: number;
  absoluteDifference: number;
  ppmDifference: number;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  ambiguityWarning: string;
  sources: Array<{
    name: string;
    externalId: string;
    externalUrl?: string;
    licenseType: LicenseType;
  }>;
  identifiers: {
    pubchemCid?: string;
    chebiId?: string;
    hmdbId?: string;
    inchi?: string;
    inchikey?: string;
    smiles?: string;
    canonicalSmiles?: string;
    isomericSmiles?: string;
  };
  clinicalSummary?: string;
  warnings: string[];
}

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
