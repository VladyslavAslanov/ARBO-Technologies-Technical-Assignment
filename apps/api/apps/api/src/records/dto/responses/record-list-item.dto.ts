import { ApiProperty } from "@nestjs/swagger";
import { DefectType } from "@prisma/client";

export class RecordListItemDto {
  @ApiProperty({ example: "8d2f7b2a-4f1f-4a6e-9b8b-8c7c4e1a2d3f" })
  id!: string;

  @ApiProperty({ enum: DefectType, example: DefectType.DEAD_WOOD })
  defectType!: DefectType;

  @ApiProperty({ minimum: 1, maximum: 5, example: 3 })
  severity!: number;

  @ApiProperty({ nullable: true, example: "Poznámka..." })
  note!: string | null;

  @ApiProperty({ nullable: true, example: 50.087451 })
  lat!: number | null;

  @ApiProperty({ nullable: true, example: 14.420671 })
  lng!: number | null;

  @ApiProperty({ nullable: true, example: 12.3 })
  locationAccuracy!: number | null;

  @ApiProperty({ nullable: true, example: "2026-01-31T06:40:00.000Z" })
  recordedAt!: string | null;

  @ApiProperty({ example: "2026-01-31T06:50:03.123Z" })
  createdAt!: string;

  @ApiProperty({
    nullable: true,
    example: "/uploads/9f3c2a18-5c3c-4a93-9b2d-2b8d6a6d2c1a.jpg",
  })
  coverPhotoPath!: string | null;

  @ApiProperty({ example: 4 })
  photosCount!: number;
}
