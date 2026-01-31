import { ApiProperty } from '@nestjs/swagger';
import { RecordListItemDto } from './record-list-item.dto';

export class ListRecordsResponseDto {
  @ApiProperty({ type: [RecordListItemDto] })
  items!: RecordListItemDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ enum: [7, 14, 30], example: 30 })
  days!: 7 | 14 | 30;

  @ApiProperty({ example: true })
  hasMore!: boolean;
}
