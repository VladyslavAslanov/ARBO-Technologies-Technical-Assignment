import { ApiProperty } from "@nestjs/swagger";
import { DefectType } from "@prisma/client";
import type { DefectCategory } from "../defect-types.constants";

export class DefectTypeItemDto {
  @ApiProperty({ enum: DefectType, example: DefectType.DEAD_WOOD })
  key!: DefectType;

  @ApiProperty({ enum: ["CROWN", "TRUNK", "ROOTS", "OTHER"], example: "CROWN" })
  category!: DefectCategory;
}
