import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ImportJobDocument = HydratedDocument<ImportJob>;

@Schema({ _id: false })
class ImportError {
  @Prop()
  externalId?: string;

  @Prop({ required: true })
  message!: string;

  @Prop()
  stack?: string;

  @Prop({ required: true })
  createdAt!: Date;
}

@Schema({ timestamps: true, collection: "import_jobs" })
export class ImportJob {
  @Prop({ required: true, index: true })
  source!: string;

  @Prop({ enum: ["pending", "running", "completed", "failed", "partial"], required: true })
  status!: "pending" | "running" | "completed" | "failed" | "partial";

  @Prop({ required: true, default: 0 })
  totalRequested!: number;

  @Prop({ required: true, default: 0 })
  totalRead!: number;

  @Prop({ required: true, default: 0 })
  created!: number;

  @Prop({ required: true, default: 0 })
  updated!: number;

  @Prop({ required: true, default: 0 })
  skipped!: number;

  @Prop({ required: true, default: 0 })
  failed!: number;

  @Prop({ type: Object, default: {} })
  checkpoint!: Record<string, unknown>;

  @Prop({ type: [ImportError], default: [] })
  errors!: ImportError[];

  @Prop({ required: true })
  startedAt!: Date;

  @Prop()
  finishedAt?: Date;
}

export const ImportJobSchema = SchemaFactory.createForClass(ImportJob);

