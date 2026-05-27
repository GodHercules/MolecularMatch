import { describe, expect, it } from "vitest";
import { getMassRange } from "../src/utils/mass";

describe("getMassRange", () => {
  it("calcula tolerancia em Dalton", () => {
    expect(getMassRange(100, "da", 0.5)).toEqual({ min: 99.5, max: 100.5 });
  });

  it("calcula tolerancia em ppm", () => {
    const range = getMassRange(500, "ppm", 10);
    expect(range.min).toBeCloseTo(499.995, 6);
    expect(range.max).toBeCloseTo(500.005, 6);
  });

  it("calcula tolerancia percentual", () => {
    const range = getMassRange(200, "percent", 1.2);
    expect(range.min).toBeCloseTo(197.6, 6);
    expect(range.max).toBeCloseTo(202.4, 6);
  });
});

