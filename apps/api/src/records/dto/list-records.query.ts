import { DefectType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export enum RecordsSortBy {
  createdAt = 'createdAt',
  severity = 'severity',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class ListRecordsQuery {
  // Multi: ?defectType=A&defectType=B
  @IsOptional()
  @IsEnum(DefectType, { each: true })
  defectType?: DefectType[] | DefectType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minSeverity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxSeverity?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasLocation?: boolean;

  // Preset only
  @IsOptional()
  @Type(() => Number)
  @IsIn([7, 14, 30])
  days?: 7 | 14 | 30;

  @IsOptional()
  @IsEnum(RecordsSortBy)
  sortBy?: RecordsSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
