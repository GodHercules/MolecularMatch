import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AppSettingsDocument = HydratedDocument<AppSettings>;

@Schema({ timestamps: true, collection: "app_settings" })
export class AppSettings {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ type: Object, required: true })
  value!: Record<string, unknown>;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);

