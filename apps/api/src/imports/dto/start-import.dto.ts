import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class StartPubchemImportDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  startCid = 1;

  @ApiPropertyOptional({ default: 5000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50000)
  @IsOptional()
  limit = 5000;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  resume = false;
}

export class StartChebiImportDto {
  @ApiPropertyOptional({ default: 5000 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50000)
  @IsOptional()
  limit = 5000;
}

export class StartHmdbImportDto {
  @ApiPropertyOptional({ default: "./data/hmdb_metabolites.xml" })
  @IsString()
  @IsOptional()
  file = "./data/hmdb_metabolites.xml";
}

