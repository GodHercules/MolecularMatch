import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { SearchBatchDto, SearchSingleDto } from "./dto/search.dto";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post("single")
  single(@Body() dto: SearchSingleDto) {
    return this.searchService.searchSingle(dto);
  }

  @Post("batch")
  batch(@Body() dto: SearchBatchDto) {
    return this.searchService.searchBatch(dto);
  }

  @Get("history")
  history() {
    return this.searchService.history();
  }

  @Get(":id")
  byId(@Param("id") id: string) {
    return this.searchService.historyById(id);
  }
}

