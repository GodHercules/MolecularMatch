import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";
import { ImportJob, ImportJobSchema } from "../schemas/import-job.schema";
import { AdminGuard } from "../common/guards/admin.guard";

@Module({
  imports: [MongooseModule.forFeature([{ name: ImportJob.name, schema: ImportJobSchema }])],
  controllers: [ImportsController],
  providers: [ImportsService, AdminGuard],
  exports: [ImportsService]
})
export class ImportsModule {}

