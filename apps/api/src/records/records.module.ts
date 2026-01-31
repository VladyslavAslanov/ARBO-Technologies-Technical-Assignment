import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DeviceIdGuard } from '../common/auth/device-id.guard';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RecordsController],
  providers: [RecordsService, DeviceIdGuard],
})
export class RecordsModule {}
