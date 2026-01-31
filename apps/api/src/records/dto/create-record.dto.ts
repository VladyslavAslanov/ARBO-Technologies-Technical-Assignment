import { DefectType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecordDto {
  @IsEnum(DefectType)
  defectType!: DefectType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severity!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationAccuracy?: number;

  @IsOptional()
  @Type(() => Date)
  recordedAt?: Date;
}
