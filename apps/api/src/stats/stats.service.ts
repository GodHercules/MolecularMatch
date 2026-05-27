import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Substance, SubstanceDocument } from "../schemas/substance.schema";
import { ImportJob, ImportJobDocument } from "../schemas/import-job.schema";
import { DEMO_WARNING, SCIENTIFIC_WARNING } from "../common/constants";

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Substance.name)
    private readonly substanceModel: Model<SubstanceDocument>,
    @InjectModel(ImportJob.name)
    private readonly importJobModel: Model<ImportJobDocument>
  ) {}

  async getStats() {
    const [total, real, demo, pubchem, chebi, hmdb, latestImport] = await Promise.all([
      this.substanceModel.countDocuments({}),
      this.substanceModel.countDocuments({ "flags.isDemo": { $ne: true } }),
      this.substanceModel.countDocuments({ "flags.isDemo": true }),
      this.substanceModel.countDocuments({ "sources.name": "PubChem" }),
      this.substanceModel.countDocuments({ "sources.name": "ChEBI" }),
      this.substanceModel.countDocuments({ "sources.name": "HMDB" }),
      this.importJobModel.findOne({}).sort({ createdAt: -1 }).lean().exec()
    ]);

    return {
      totals: { total, real, demo, pubchem, chebi, hmdb },
      latestImport,
      warnings: {
        scientific: SCIENTIFIC_WARNING,
        demoOnly: real === 0 ? DEMO_WARNING : null
      }
    };
  }
}

