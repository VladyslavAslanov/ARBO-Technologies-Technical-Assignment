import { ApiProperty } from "@nestjs/swagger";

export class RecordPhotoDto {
  @ApiProperty({ example: "c7f3f1b6-3f14-4b48-9f85-9d5c9c1c2f2a" })
  id!: string;

  @ApiProperty({ example: "/uploads/9f3c2a18-5c3c-4a93-9b2d-2b8d6a6d2c1a.jpg" })
  path!: string;

  @ApiProperty({ example: "image/jpeg" })
  mimeType!: string;

  @ApiProperty({ example: 345678 })
  sizeBytes!: number;

  @ApiProperty({ example: "2026-01-31T06:50:03.123Z" })
  createdAt!: string;
}
