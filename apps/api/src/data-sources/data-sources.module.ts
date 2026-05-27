import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DataSource, DataSourceSchema } from "../schemas/data-source.schema";
import { DataSourcesController } from "./data-sources.controller";
import { DataSourcesService } from "./data-sources.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: DataSource.name, schema: DataSourceSchema }])],
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
  exports: [DataSourcesService]
})
export class DataSourcesModule {}

