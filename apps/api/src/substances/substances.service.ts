import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Substance, SubstanceDocument } from "../schemas/substance.schema";
import { SubstancesQueryDto } from "./dto/substances-query.dto";

@Injectable()
export class SubstancesService {
  constructor(
    @InjectModel(Substance.name)
    private readonly substanceModel: Model<SubstanceDocument>
  ) {}

  async list(query: SubstancesQueryDto) {
    const filter: FilterQuery<SubstanceDocument> = {};

    if (query.q) {
      filter.$text = { $search: query.q };
    }

    if (query.source) {
      filter["sources.name"] = query.source;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.substanceModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      this.substanceModel.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit)
    };
  }

  async findById(id: string) {
    const doc = await this.substanceModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException("Substancia nao encontrada");
    return doc;
  }

  async findBySource(source: string, externalId: string) {
    const doc = await this.substanceModel
      .findOne({ sources: { $elemMatch: { name: source, externalId } } })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException("Substancia nao encontrada");
    return doc;
  }

  async findByInchikey(inchikey: string) {
    const doc = await this.substanceModel
      .findOne({ "identifiers.inchikey": inchikey.toUpperCase() })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException("Substancia nao encontrada");
    return doc;
  }

  async counts() {
    const [total, pubchem, chebi, hmdb, demo] = await Promise.all([
      this.substanceModel.countDocuments({}),
      this.substanceModel.countDocuments({ "sources.name": "PubChem" }),
      this.substanceModel.countDocuments({ "sources.name": "ChEBI" }),
      this.substanceModel.countDocuments({ "sources.name": "HMDB" }),
      this.substanceModel.countDocuments({ "flags.isDemo": true })
    ]);

    return { total, pubchem, chebi, hmdb, demo, real: Math.max(total - demo, 0) };
  }

  async clearDemo() {
    const res = await this.substanceModel.deleteMany({ "flags.isDemo": true });
    return { deleted: res.deletedCount };
  }
}

