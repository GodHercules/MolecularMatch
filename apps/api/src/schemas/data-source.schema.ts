import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DataSourceDocument = HydratedDocument<DataSource>;

@Schema({ timestamps: true, collection: "data_sources" })
export class DataSource {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true, enum: ["open", "restricted_commercial_use", "unknown"] })
  licenseType!: "open" | "restricted_commercial_use" | "unknown";

  @Prop({ required: true })
  sourceUrl!: string;

  @Prop({ default: true })
  enabled!: boolean;

  @Prop({ default: "" })
  notes!: string;
}

export const DataSourceSchema = SchemaFactory.createForClass(DataSource);

