import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type SearchResultDocument = HydratedDocument<SearchResult>;

@Schema({ timestamps: true, collection: "search_results" })
export class SearchResult {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  searchHistoryId!: Types.ObjectId;

  @Prop({ required: true })
  searchedMass!: number;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  substanceId!: Types.ObjectId;

  @Prop({ required: true })
  matchedMassType!: string;

  @Prop({ required: true })
  matchedMassValue!: number;

  @Prop({ required: true })
  absoluteDifference!: number;

  @Prop({ required: true })
  ppmDifference!: number;

  @Prop({ required: true })
  confidenceLevel!: string;

  @Prop({ required: true })
  confidenceScore!: number;

  @Prop({ required: true })
  ambiguityWarning!: string;

  @Prop({ type: [String], default: [] })
  warnings!: string[];
}

export const SearchResultSchema = SchemaFactory.createForClass(SearchResult);
SearchResultSchema.index({ searchHistoryId: 1, searchedMass: 1 });

