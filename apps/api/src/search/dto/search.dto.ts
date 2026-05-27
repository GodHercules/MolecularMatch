import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, Max, Min } from "class-validator";
import { AppMode, MassType, ToleranceType } from "@molecular-match/shared";

export class SearchSingleDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  mass!: number;

  @ApiProperty({ enum: ["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"] })
  @IsEnum(["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"])
  massType!: MassType;

  @ApiProperty({ enum: ["da", "ppm", "percent"] })
  @IsEnum(["da", "ppm", "percent"])
  toleranceType!: ToleranceType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  toleranceValue!: number;

  @ApiPropertyOptional({ default: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  limitPerMass = 25;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  includeRestrictedSources = false;

  @ApiPropertyOptional({ enum: ["internal_test", "commercial"], default: "internal_test" })
  @IsEnum(["internal_test", "commercial"])
  @IsOptional()
  appMode: AppMode = "internal_test";
}

export class SearchBatchDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @Type(() => Number)
  masses!: number[];

  @ApiProperty({ enum: ["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"] })
  @IsEnum(["molecularWeight", "exactMass", "monoisotopicMass", "averageMass", "auto"])
  massType!: MassType;

  @ApiProperty({ enum: ["da", "ppm", "percent"] })
  @IsEnum(["da", "ppm", "percent"])
  toleranceType!: ToleranceType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  toleranceValue!: number;

  @ApiPropertyOptional({ default: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  limitPerMass = 25;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  includeRestrictedSources = false;

  @ApiPropertyOptional({ enum: ["internal_test", "commercial"], default: "internal_test" })
  @IsEnum(["internal_test", "commercial"])
  @IsOptional()
  appMode: AppMode = "internal_test";
}

