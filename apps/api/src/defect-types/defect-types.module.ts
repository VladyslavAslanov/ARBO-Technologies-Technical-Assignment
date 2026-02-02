import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { DeviceIdGuard } from "../common/auth/device-id.guard";
import { DefectTypesController } from "./defect-types.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [DefectTypesController],
  providers: [DeviceIdGuard],
})
export class DefectTypesModule {}
