import { describe, expect, it } from "vitest";
import { calculateMassMatchScore } from "../src/utils/score";

describe("calculateMassMatchScore", () => {
  it("reduz score quando ha muitos candidatos", () => {
    const score = calculateMassMatchScore(100, 100.0001, 1, {
      sourceCount: 1,
      sourceReliabilityScore: 40,
      hasInchikey: true,
      hasFormula: true,
      hasStructure: true,
      hasClinicalData: false,
      closeCandidatesCount: 20,
      multiSourceSameInchikey: false,
      hasRestrictedOnly: false
    });

    expect(score.confidenceScore).toBeLessThan(96);
  });
});

