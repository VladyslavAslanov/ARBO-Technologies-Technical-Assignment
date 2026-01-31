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
  @IsEnum(DefectType, {
    message: 'defectType must be a valid DefectType enum value',
  })
  defectType!: DefectType;

  @Type(() => Number)
  @IsInt({ message: 'severity must be an integer' })
  @Min(1, { message: 'severity must be between 1 and 5' })
  @Max(5, { message: 'severity must be between 1 and 5' })
  severity!: number;

  @IsOptional()
  @IsString({ message: 'note must be a string' })
  note?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lat must be a number' })
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lng must be a number' })
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'locationAccuracy must be a number' })
  locationAccuracy?: number;

  @IsOptional()
  @Type(() => Date)
  recordedAt?: Date;
}
