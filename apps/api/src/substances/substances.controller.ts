import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubstancesService } from "./substances.service";
import { SubstancesQueryDto } from "./dto/substances-query.dto";

@ApiTags("substances")
@Controller("substances")
export class SubstancesController {
  constructor(private readonly substancesService: SubstancesService) {}

  @Get()
  findAll(@Query() query: SubstancesQueryDto) {
    return this.substancesService.list(query);
  }

  @Get("by-source/:source/:externalId")
  bySource(@Param("source") source: string, @Param("externalId") externalId: string) {
    return this.substancesService.findBySource(source, externalId);
  }

  @Get("by-inchikey/:inchikey")
  byInchiKey(@Param("inchikey") inchikey: string) {
    return this.substancesService.findByInchikey(inchikey);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.substancesService.findById(id);
  }
}

