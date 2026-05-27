import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  MASS_FIELDS,
  MatchResult,
  MassType,
  calculateMassMatchScore,
  calculatePpmDifference,
  canUseSource,
  getLicenseWarnings,
  getMassRange,
  searchInputSchema,
  sortMatchResults
} from "@molecular-match/shared";
import { Substance, SubstanceDocument } from "../schemas/substance.schema";
import { SearchHistory, SearchHistoryDocument } from "../schemas/search-history.schema";
import { SearchResult, SearchResultDocument } from "../schemas/search-result.schema";
import { SearchBatchDto, SearchSingleDto } from "./dto/search.dto";
import { SCIENTIFIC_WARNING } from "../common/constants";

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Substance.name)
    private readonly substanceModel: Model<SubstanceDocument>,
    @InjectModel(SearchHistory.name)
    private readonly historyModel: Model<SearchHistoryDocument>,
    @InjectModel(SearchResult.name)
    private readonly searchResultModel: Model<SearchResultDocument>
  ) {}

  async searchSingle(dto: SearchSingleDto) {
    return this.searchByMolecularMass({ ...dto, masses: [dto.mass] }, "single");
  }

  async searchBatch(dto: SearchBatchDto) {
    return this.searchByMolecularMass(dto, "batch");
  }

  async searchByMolecularMass(
    input: {
      masses: number[];
      massType: MassType;
      toleranceType: "da" | "ppm" | "percent";
      toleranceValue: number;
      limitPerMass: number;
      includeRestrictedSources: boolean;
      appMode: "internal_test" | "commercial";
    },
    searchType: "single" | "batch"
  ) {
    const parsed = searchInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const masses = Array.from(
      new Set(
        parsed.data.masses.map((mass) => Number(mass)).filter((mass) => Number.isFinite(mass) && mass > 0)
      )
    );

    if (!masses.length) {
      throw new BadRequestException("Nenhuma massa valida informada");
    }

    const allResults: MatchResult[] = [];

    for (const mass of masses) {
      const fields =
        parsed.data.massType === "auto"
          ? MASS_FIELDS
          : [parsed.data.massType as Exclude<MassType, "auto">];

      const ranges = fields.map((f) => ({ field: f, range: getMassRange(mass, parsed.data.toleranceType, parsed.data.toleranceValue) }));

      const orQuery = ranges.map((entry) => ({
        [`masses.${entry.field}`]: {
          $gte: entry.range.min,
          $lte: entry.range.max
        }
      }));

      const candidates = await this.substanceModel
        .find({ $or: orQuery })
        .limit(parsed.data.limitPerMass * 10)
        .lean()
        .exec();

      const mapped: MatchResult[] = [];

      for (const candidate of candidates) {
        const allowedSources = candidate.sources.filter((s) =>
          canUseSource(s.licenseType, parsed.data.appMode, parsed.data.includeRestrictedSources)
        );

        if (!allowedSources.length) continue;

        const best = this.pickBestMass(candidate, mass, fields);
        if (!best) continue;

        const ppm = calculatePpmDifference(mass, best.value);
        const score = calculateMassMatchScore(mass, best.value, ppm, {
          sourceCount: allowedSources.length,
          sourceReliabilityScore: candidate.computed?.sourceReliabilityScore ?? 50,
          hasInchikey: Boolean(candidate.identifiers?.inchikey),
          hasFormula: Boolean(candidate.molecularFormula),
          hasStructure: Boolean(candidate.identifiers?.smiles || candidate.identifiers?.inchi),
          hasClinicalData: Boolean(candidate.flags?.hasClinicalData),
          closeCandidatesCount: candidates.length,
          multiSourceSameInchikey: allowedSources.length > 1 && Boolean(candidate.identifiers?.inchikey),
          hasRestrictedOnly: allowedSources.every((s) => s.licenseType !== "open")
        });

        const warnings = getLicenseWarnings(
          allowedSources.map((s) => s.licenseType),
          parsed.data.appMode
        );

        mapped.push({
          searchedMass: mass,
          substanceId: String(candidate._id),
          primaryName: candidate.primaryName,
          molecularFormula: candidate.molecularFormula,
          matchedMassType: best.field,
          matchedMassValue: best.value,
          absoluteDifference: Number(Math.abs(mass - best.value).toFixed(6)),
          ppmDifference: Number(ppm.toFixed(3)),
          confidenceLevel: score.confidenceLevel,
          confidenceScore: score.confidenceScore,
          ambiguityWarning: score.ambiguityWarning,
          sources: allowedSources.map((s) => ({
            name: s.name,
            externalId: s.externalId,
            externalUrl: s.externalUrl,
            licenseType: s.licenseType
          })),
          identifiers: {
            pubchemCid: candidate.identifiers?.pubchemCid,
            chebiId: candidate.identifiers?.chebiId,
            hmdbId: candidate.identifiers?.hmdbId,
            inchikey: candidate.identifiers?.inchikey,
            smiles: candidate.identifiers?.smiles,
            inchi: candidate.identifiers?.inchi
          },
          clinicalSummary: candidate.clinical?.notes,
          warnings
        });
      }

      const sorted = sortMatchResults(mapped).slice(0, parsed.data.limitPerMass);
      allResults.push(...sorted);
    }

    const history = await this.historyModel.create({
      searchType,
      masses,
      massType: parsed.data.massType,
      toleranceType: parsed.data.toleranceType,
      toleranceValue: parsed.data.toleranceValue,
      resultCount: allResults.length,
      appMode: parsed.data.appMode,
      searchResultIds: []
    });

    if (allResults.length) {
      const docs = await this.searchResultModel.insertMany(
        allResults.map((r) => ({
          searchHistoryId: history._id,
          searchedMass: r.searchedMass,
          substanceId: new Types.ObjectId(r.substanceId),
          matchedMassType: r.matchedMassType,
          matchedMassValue: r.matchedMassValue,
          absoluteDifference: r.absoluteDifference,
          ppmDifference: r.ppmDifference,
          confidenceLevel: r.confidenceLevel,
          confidenceScore: r.confidenceScore,
          ambiguityWarning: r.ambiguityWarning,
          warnings: r.warnings
        }))
      );

      history.searchResultIds = docs.map((d) => d._id as Types.ObjectId);
      await history.save();
    }

    return {
      searchId: String(history._id),
      scientificWarning: SCIENTIFIC_WARNING,
      resultCount: allResults.length,
      items: allResults
    };
  }

  private pickBestMass(
    candidate: SubstanceDocument | Record<string, any>,
    targetMass: number,
    fields: Array<Exclude<MassType, "auto">>
  ) {
    let best: { field: Exclude<MassType, "auto">; value: number; diff: number } | null = null;

    for (const field of fields) {
      const value = candidate.masses?.[field];
      if (typeof value !== "number") continue;
      const diff = Math.abs(value - targetMass);

      if (!best || diff < best.diff) {
        best = { field, value, diff };
      }
    }

    return best;
  }

  async history() {
    return this.historyModel.find({}).sort({ createdAt: -1 }).limit(100).lean().exec();
  }

  async historyById(id: string) {
    const history = await this.historyModel.findById(id).lean().exec();
    if (!history) {
      throw new BadRequestException("Busca nao encontrada");
    }

    const results = await this.searchResultModel.find({ searchHistoryId: history._id }).lean().exec();
    return { history, results };
  }
}

