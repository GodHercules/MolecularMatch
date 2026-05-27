import { describe, expect, it } from "vitest";
import { dedupeKey, mergeSubstance } from "../src/utils/dedupe";

describe("dedupe", () => {
  it("gera chave por InChIKey", () => {
    const keys = dedupeKey({
      primaryName: "A",
      masses: {},
      identifiers: { inchikey: "ABCD-EFG" },
      sources: []
    });

    expect(keys[0]).toContain("inchikey");
  });

  it("faz merge de fontes", () => {
    const now = new Date();
    const merged = mergeSubstance(
      {
        primaryName: "Water",
        masses: { molecularWeight: 18.015 },
        identifiers: { inchikey: "X" },
        sources: [
          {
            name: "PubChem",
            externalId: "1",
            licenseType: "open",
            importedAt: now,
            lastSeenAt: now,
            sourceReliabilityScore: 90,
            rawAvailable: true
          }
        ]
      },
      {
        primaryName: "Water",
        masses: { exactMass: 18.0106 },
        identifiers: { chebiId: "CHEBI:1", inchikey: "X" },
        sources: [
          {
            name: "ChEBI",
            externalId: "CHEBI:1",
            licenseType: "open",
            importedAt: now,
            lastSeenAt: now,
            sourceReliabilityScore: 85,
            rawAvailable: false
          }
        ]
      }
    );

    expect(merged.sources).toHaveLength(2);
    expect(merged.identifiers.chebiId).toBe("CHEBI:1");
  });
});

