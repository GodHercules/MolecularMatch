import { z } from "zod";

export const searchInputSchema = z.object({
  masses: z.array(z.number().positive()).min(1).max(500),
  massType: z.enum([
    "molecularWeight",
    "exactMass",
    "monoisotopicMass",
    "averageMass",
    "auto"
  ]),
  toleranceType: z.enum(["da", "ppm", "percent"]),
  toleranceValue: z.number().positive(),
  limitPerMass: z.number().int().positive().max(200).default(25),
  includeRestrictedSources: z.boolean().default(false),
  appMode: z.enum(["internal_test", "commercial"]).default("internal_test")
});

export type SearchInputSchema = z.infer<typeof searchInputSchema>;

