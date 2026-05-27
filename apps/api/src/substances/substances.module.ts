import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubstancesController } from "./substances.controller";
import { SubstancesService } from "./substances.service";
import { Substance, SubstanceSchema } from "../schemas/substance.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Substance.name, schema: SubstanceSchema }])],
  controllers: [SubstancesController],
  providers: [SubstancesService],
  exports: [SubstancesService, MongooseModule]
})
export class SubstancesModule {}

