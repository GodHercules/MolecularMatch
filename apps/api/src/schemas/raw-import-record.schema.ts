import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RawImportRecordDocument = HydratedDocument<RawImportRecord>;

@Schema({ timestamps: false, collection: "raw_import_records" })
export class RawImportRecord {
  @Prop({ enum: ["PubChem", "ChEBI", "HMDB"], required: true })
  source!: "PubChem" | "ChEBI" | "HMDB";

  @Prop({ required: true, index: true })
  externalId!: string;

  @Prop({ type: Object, required: true })
  rawPayload!: Record<string, unknown>;

  @Prop({ required: true })
  importedAt!: Date;

  @Prop({ required: true })
  parserVersion!: string;

  @Prop({ required: true })
  checksum!: string;
}

export const RawImportRecordSchema = SchemaFactory.createForClass(RawImportRecord);
RawImportRecordSchema.index({ source: 1, externalId: 1 }, { unique: true });

