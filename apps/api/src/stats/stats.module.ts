import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StatsService } from "./stats.service";
import { StatsController } from "./stats.controller";
import { Substance, SubstanceSchema } from "../schemas/substance.schema";
import { ImportJob, ImportJobSchema } from "../schemas/import-job.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Substance.name, schema: SubstanceSchema },
      { name: ImportJob.name, schema: ImportJobSchema }
    ])
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}

