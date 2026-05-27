import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import appConfig from "./config/app.config";
import { DatabaseModule } from "./database/database.module";
import { SubstancesModule } from "./substances/substances.module";
import { SearchModule } from "./search/search.module";
import { ImportsModule } from "./imports/imports.module";
import { DataSourcesModule } from "./data-sources/data-sources.module";
import { HealthModule } from "./health/health.module";
import { AdminModule } from "./admin/admin.module";
import { StatsModule } from "./stats/stats.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    DatabaseModule,
    SubstancesModule,
    SearchModule,
    ImportsModule,
    DataSourcesModule,
    HealthModule,
    AdminModule,
    StatsModule
  ]
})
export class AppModule {}

