import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class SubstancesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;
}

