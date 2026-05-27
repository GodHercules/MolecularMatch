import { describe, expect, it } from "vitest";
import { matchesToCsv } from "../src/utils/csv";

describe("matchesToCsv", () => {
  it("exporta CSV com cabecalho", () => {
    const csv = matchesToCsv([
      {
        searchedMass: 100,
        substanceId: "id",
        primaryName: "A",
        matchedMassType: "exactMass",
        matchedMassValue: 100,
        absoluteDifference: 0,
        ppmDifference: 0,
        confidenceLevel: "HIGH_COMPATIBILITY",
        confidenceScore: 95,
        ambiguityWarning: "ok",
        sources: [{ name: "PubChem", externalId: "1", licenseType: "open" }],
        identifiers: {},
        warnings: []
      }
    ]);

    expect(csv).toContain("searchedMass");
    expect(csv).toContain("PubChem:1");
  });
});

