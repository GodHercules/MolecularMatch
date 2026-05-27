import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminGuard } from "../common/guards/admin.guard";
import { SubstancesModule } from "../substances/substances.module";
import { StatsModule } from "../stats/stats.module";

@Module({
  imports: [SubstancesModule, StatsModule],
  controllers: [AdminController],
  providers: [AdminGuard]
})
export class AdminModule {}

