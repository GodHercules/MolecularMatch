export type AppMode = "internal_test" | "commercial";
export type LicenseType = "open" | "restricted_commercial_use" | "unknown";

export type MassType =
  | "molecularWeight"
  | "exactMass"
  | "monoisotopicMass"
  | "averageMass"
  | "auto";

export type ToleranceType = "da" | "ppm" | "percent";

export type ConfidenceLevel =
  | "HIGH_COMPATIBILITY"
  | "MODERATE_COMPATIBILITY"
  | "POSSIBLE_COMPATIBILITY"
  | "INCONCLUSIVE";

export interface SourceRef {
  name: string;
  externalId: string;
  externalUrl?: string;
  licenseType: LicenseType;
  importedAt: Date;
  lastSeenAt: Date;
  sourceReliabilityScore: number;
  rawAvailable: boolean;
}

export interface IdentifierSet {
  pubchemCid?: string;
  chebiId?: string;
  hmdbId?: string;
  cas?: string[];
  inchi?: string;
  inchikey?: string;
  smiles?: string;
  canonicalSmiles?: string;
  isomericSmiles?: string;
}

export interface SubstanceMasses {
  molecularWeight?: number;
  exactMass?: number;
  monoisotopicMass?: number;
  averageMass?: number;
}

export interface SubstanceInput {
  primaryName: string;
  molecularFormula?: string;
  iupacName?: string;
  description?: string;
  masses: SubstanceMasses;
  identifiers: IdentifierSet;
  synonyms?: Array<{ value: string; source: string; language?: string }>;
  sources: SourceRef[];
  categories?: {
    substanceType?: string;
    clinicalCategory?: string;
    toxicologyCategory?: string;
    pharmacologicalCategory?: string;
    biologicalRole?: string[];
    pathways?: string[];
    biospecimens?: string[];
  };
  clinical?: {
    notes?: string;
    diseases?: string[];
    normalConcentrations?: unknown[];
    abnormalConcentrations?: unknown[];
    biomarkers?: string[];
  };
  flags?: {
    isDemo?: boolean;
    hasRestrictedCommercialSource?: boolean;
  };
}

export interface SearchInput {
  masses: number[];
  massType: MassType;
  toleranceType: ToleranceType;
  toleranceValue: number;
  limitPerMass: number;
  includeRestrictedSources: boolean;
  appMode: AppMode;
}

export interface MatchResult {
  searchedMass: number;
  substanceId: string;
  primaryName: string;
  molecularFormula?: string;
  matchedMassType: Exclude<MassType, "auto">;
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
  identifiers: IdentifierSet;
  clinicalSummary?: string;
  warnings: string[];
}

export interface ImportJobCheckpoint {
  cursor?: number;
  lastExternalId?: string;
  chunk?: number;
}

export interface ImportJobSummary {
  source: string;
  status: "pending" | "running" | "completed" | "failed" | "partial";
  totalRequested: number;
  totalRead: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  checkpoint?: ImportJobCheckpoint;
}

