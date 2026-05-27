import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataSourcesService } from "./data-sources.service";

@ApiTags("data-sources")
@Controller("data-sources")
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  list() {
    return this.dataSourcesService.list();
  }
}

