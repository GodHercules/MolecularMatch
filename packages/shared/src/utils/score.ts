import { ConfidenceLevel, MatchResult } from "../types";

interface ScoreContext {
  sourceCount: number;
  sourceReliabilityScore: number;
  hasInchikey: boolean;
  hasFormula: boolean;
  hasStructure: boolean;
  hasClinicalData: boolean;
  closeCandidatesCount: number;
  multiSourceSameInchikey: boolean;
  hasRestrictedOnly: boolean;
}

export function classifyScore(score: number): ConfidenceLevel {
  if (score >= 85) return "HIGH_COMPATIBILITY";
  if (score >= 70) return "MODERATE_COMPATIBILITY";
  if (score >= 55) return "POSSIBLE_COMPATIBILITY";
  return "INCONCLUSIVE";
}

export function calculateMassMatchScore(
  searchedMass: number,
  matchedMass: number,
  ppmDifference: number,
  context: ScoreContext
): { confidenceScore: number; confidenceLevel: ConfidenceLevel; ambiguityWarning: string } {
  const absDiff = Math.abs(searchedMass - matchedMass);
  let score = 100;

  score -= Math.min(absDiff * 150, 45);
  score -= Math.min(ppmDifference / 8, 25);

  score += Math.min(context.sourceCount * 2.5, 10);
  score += Math.min(context.sourceReliabilityScore / 10, 10);

  if (!context.hasInchikey) score -= 12;
  if (!context.hasFormula) score -= 8;
  if (!context.hasStructure) score -= 6;
  if (context.hasClinicalData) score += 4;

  if (context.closeCandidatesCount > 10) score -= 12;
  else if (context.closeCandidatesCount > 5) score -= 6;

  if (context.multiSourceSameInchikey) score += 8;
  if (context.hasRestrictedOnly) score -= 25;

  const clamped = Math.max(0, Math.min(100, Number(score.toFixed(2))));

  let ambiguityWarning = "Resultado inconclusivo";
  if (context.closeCandidatesCount <= 2 && clamped >= 85) {
    ambiguityWarning = "Pouca ambiguidade observada para esta massa";
  } else if (context.closeCandidatesCount > 6) {
    ambiguityWarning =
      "Multiplos candidatos proximos encontrados; use dados complementares para desambiguacao";
  } else {
    ambiguityWarning = "Possiveis correspondencias multiplas; validar com dados experimentais";
  }

  return {
    confidenceScore: clamped,
    confidenceLevel: classifyScore(clamped),
    ambiguityWarning
  };
}

export function sortMatchResults(items: MatchResult[]): MatchResult[] {
  return [...items].sort((a, b) => {
    if (b.confidenceScore !== a.confidenceScore) {
      return b.confidenceScore - a.confidenceScore;
    }
    if (a.absoluteDifference !== b.absoluteDifference) {
      return a.absoluteDifference - b.absoluteDifference;
    }
    return a.ppmDifference - b.ppmDifference;
  });
}

