import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { Substance, SubstanceSchema } from "../schemas/substance.schema";
import { SearchHistory, SearchHistorySchema } from "../schemas/search-history.schema";
import { SearchResult, SearchResultSchema } from "../schemas/search-result.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Substance.name, schema: SubstanceSchema },
      { name: SearchHistory.name, schema: SearchHistorySchema },
      { name: SearchResult.name, schema: SearchResultSchema }
    ])
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService]
})
export class SearchModule {}

