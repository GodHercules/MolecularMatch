import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ImportsService } from "./imports.service";
import {
  StartChebiImportDto,
  StartHmdbImportDto,
  StartPubchemImportDto
} from "./dto/start-import.dto";
import { AdminGuard } from "../common/guards/admin.guard";

@ApiTags("imports")
@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("pubchem/start")
  @UseGuards(AdminGuard)
  @ApiSecurity("admin")
  startPubchem(@Body() dto: StartPubchemImportDto) {
    return this.importsService.startPubchem(dto);
  }

  @Post("chebi/start")
  @UseGuards(AdminGuard)
  @ApiSecurity("admin")
  startChebi(@Body() dto: StartChebiImportDto) {
    return this.importsService.startChebi(dto);
  }

  @Post("hmdb/start")
  @UseGuards(AdminGuard)
  @ApiSecurity("admin")
  startHmdb(@Body() dto: StartHmdbImportDto) {
    return this.importsService.startHmdb(dto);
  }

  @Get("jobs")
  jobs() {
    return this.importsService.listJobs();
  }

  @Get("jobs/:id")
  job(@Param("id") id: string) {
    return this.importsService.getJob(id);
  }
}

