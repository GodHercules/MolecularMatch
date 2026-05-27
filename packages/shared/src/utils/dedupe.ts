import { SubstanceInput } from "../types";
import { roundMass } from "./mass";

export interface MinimalSubstanceDoc {
  _id?: string;
  primaryName: string;
  molecularFormula?: string;
  masses: {
    molecularWeight?: number;
    exactMass?: number;
    monoisotopicMass?: number;
    averageMass?: number;
  };
  identifiers: {
    pubchemCid?: string;
    chebiId?: string;
    hmdbId?: string;
    inchikey?: string;
  };
  synonyms?: Array<{ value: string; source: string; language?: string }>;
  sources: Array<{
    name: string;
    externalId: string;
    externalUrl?: string;
    licenseType: "open" | "restricted_commercial_use" | "unknown";
    importedAt: Date;
    lastSeenAt: Date;
    sourceReliabilityScore: number;
    rawAvailable: boolean;
  }>;
}

export function dedupeKey(input: SubstanceInput | MinimalSubstanceDoc): string[] {
  const keys: string[] = [];
  const inchikey = input.identifiers.inchikey?.toUpperCase();
  if (inchikey) keys.push(`inchikey:${inchikey}`);
  if (input.identifiers.pubchemCid) keys.push(`pubchem:${input.identifiers.pubchemCid}`);
  if (input.identifiers.chebiId) keys.push(`chebi:${input.identifiers.chebiId}`);
  if (input.identifiers.hmdbId) keys.push(`hmdb:${input.identifiers.hmdbId}`);

  const formula = input.molecularFormula?.trim().toUpperCase();
  const mono = roundMass(input.masses.monoisotopicMass, 4);
  if (formula && mono) keys.push(`formula-mono:${formula}:${mono}`);

  const name = input.primaryName?.trim().toUpperCase();
  if (name && formula) keys.push(`name-formula:${name}:${formula}`);

  return keys;
}

export function mergeSubstance(
  current: MinimalSubstanceDoc,
  incoming: SubstanceInput
): MinimalSubstanceDoc {
  const synMap = new Map<string, { value: string; source: string; language?: string }>();
  for (const s of current.synonyms ?? []) {
    synMap.set(`${s.value.toLowerCase()}::${s.source}`, s);
  }
  for (const s of incoming.synonyms ?? []) {
    synMap.set(`${s.value.toLowerCase()}::${s.source}`, s);
  }

  const srcMap = new Map<string, MinimalSubstanceDoc["sources"][number]>();
  for (const s of current.sources) {
    srcMap.set(`${s.name}:${s.externalId}`, s);
  }
  for (const s of incoming.sources) {
    srcMap.set(`${s.name}:${s.externalId}`, {
      ...s,
      importedAt: s.importedAt,
      lastSeenAt: s.lastSeenAt
    });
  }

  return {
    ...current,
    primaryName: current.primaryName || incoming.primaryName,
    molecularFormula: current.molecularFormula || incoming.molecularFormula,
    masses: {
      molecularWeight: current.masses.molecularWeight ?? incoming.masses.molecularWeight,
      exactMass: current.masses.exactMass ?? incoming.masses.exactMass,
      monoisotopicMass:
        current.masses.monoisotopicMass ?? incoming.masses.monoisotopicMass,
      averageMass: current.masses.averageMass ?? incoming.masses.averageMass
    },
    identifiers: {
      pubchemCid: current.identifiers.pubchemCid ?? incoming.identifiers.pubchemCid,
      chebiId: current.identifiers.chebiId ?? incoming.identifiers.chebiId,
      hmdbId: current.identifiers.hmdbId ?? incoming.identifiers.hmdbId,
      inchikey: current.identifiers.inchikey ?? incoming.identifiers.inchikey
    },
    synonyms: Array.from(synMap.values()),
    sources: Array.from(srcMap.values())
  };
}

