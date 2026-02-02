import { DefectType } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";

export enum RecordsSortBy {
  createdAt = "createdAt",
  severity = "severity",
}

export enum SortOrder {
  asc = "asc",
  desc = "desc",
}

export class ListRecordsQuery {
  @IsOptional()
  @IsEnum(DefectType, {
    each: true,
    message: "defectType must be a valid DefectType enum value",
  })
  defectType?: DefectType[] | DefectType;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "minSeverity must be an integer" })
  @Min(1, { message: "minSeverity must be between 1 and 5" })
  @Max(5, { message: "minSeverity must be between 1 and 5" })
  minSeverity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "maxSeverity must be an integer" })
  @Min(1, { message: "maxSeverity must be between 1 and 5" })
  @Max(5, { message: "maxSeverity must be between 1 and 5" })
  maxSeverity?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean({ message: "hasLocation must be a boolean (true/false)" })
  hasLocation?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsIn([7, 14, 30], { message: "days must be one of: 7, 14, 30" })
  days?: 7 | 14 | 30;

  @IsOptional()
  @IsEnum(RecordsSortBy, {
    message: "sortBy must be one of: createdAt, severity",
  })
  sortBy?: RecordsSortBy;

  @IsOptional()
  @IsEnum(SortOrder, { message: "order must be one of: asc, desc" })
  order?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be between 1 and 100" })
  @Max(100, { message: "limit must be between 1 and 100" })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "offset must be an integer" })
  @Min(0, { message: "offset must be >= 0" })
  offset?: number;
}
