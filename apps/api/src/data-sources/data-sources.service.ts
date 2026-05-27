import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DataSource, DataSourceDocument } from "../schemas/data-source.schema";

@Injectable()
export class DataSourcesService implements OnModuleInit {
  constructor(
    @InjectModel(DataSource.name)
    private readonly dataSourceModel: Model<DataSourceDocument>
  ) {}

  async onModuleInit() {
    const defaults = [
      {
        name: "PubChem",
        licenseType: "open",
        sourceUrl: "https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest",
        enabled: true,
        notes: "Fonte principal do MVP"
      },
      {
        name: "ChEBI",
        licenseType: "open",
        sourceUrl: "https://www.ebi.ac.uk/chebi/downloads",
        enabled: true,
        notes: "Dados ontologicos e estruturais"
      },
      {
        name: "HMDB",
        licenseType: "restricted_commercial_use",
        sourceUrl: "https://hmdb.ca",
        enabled: true,
        notes: "Uso comercial restrito"
      }
    ];

    for (const source of defaults) {
      await this.dataSourceModel.updateOne({ name: source.name }, { $setOnInsert: source }, { upsert: true });
    }
  }

  async list() {
    return this.dataSourceModel.find({}).sort({ name: 1 }).lean().exec();
  }
}

