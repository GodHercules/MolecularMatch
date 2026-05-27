import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SearchHistoryDocument = HydratedDocument<SearchHistory>;

@Schema({ timestamps: true, collection: "search_history" })
export class SearchHistory {
  @Prop({ required: true, enum: ["single", "batch"] })
  searchType!: "single" | "batch";

  @Prop({ type: [Number], required: true })
  masses!: number[];

  @Prop({ required: true })
  massType!: string;

  @Prop({ required: true })
  toleranceType!: string;

  @Prop({ required: true })
  toleranceValue!: number;

  @Prop({ required: true, default: 0 })
  resultCount!: number;

  @Prop({ required: true })
  appMode!: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  searchResultIds!: Types.ObjectId[];
}

export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);
SearchHistorySchema.index({ createdAt: -1 });

