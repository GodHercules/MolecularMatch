import { MassType, ToleranceType } from "../types";

export interface MassRange {
  min: number;
  max: number;
}

export function getMassRange(
  mass: number,
  toleranceType: ToleranceType,
  toleranceValue: number
): MassRange {
  if (toleranceType === "da") {
    return { min: mass - toleranceValue, max: mass + toleranceValue };
  }

  if (toleranceType === "ppm") {
    const delta = (mass * toleranceValue) / 1_000_000;
    return { min: mass - delta, max: mass + delta };
  }

  if (toleranceType === "percent") {
    const delta = (mass * toleranceValue) / 100;
    return { min: mass - delta, max: mass + delta };
  }

  throw new Error("Tipo de tolerancia invalido");
}

export function calculatePpmDifference(searched: number, matched: number): number {
  if (!searched) return 0;
  return Math.abs(((matched - searched) / searched) * 1_000_000);
}

export function roundMass(value?: number, digits = 6): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Number(value.toFixed(digits));
}

export function massTypeToField(type: Exclude<MassType, "auto">): string {
  return `masses.${type}`;
}

export const MASS_FIELDS: Array<Exclude<MassType, "auto">> = [
  "molecularWeight",
  "exactMass",
  "monoisotopicMass",
  "averageMass"
];

