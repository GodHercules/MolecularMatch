import { Controller, Delete, Get, Headers, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../common/guards/admin.guard";
import { SubstancesService } from "../substances/substances.service";
import { StatsService } from "../stats/stats.service";

@ApiTags("admin")
@ApiSecurity("admin")
@UseGuards(AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(
    private readonly substancesService: SubstancesService,
    private readonly statsService: StatsService
  ) {}

  @Get("overview")
  overview() {
    return this.statsService.getStats();
  }

  @Delete("demo-data")
  clearDemo() {
    return this.substancesService.clearDemo();
  }
}

