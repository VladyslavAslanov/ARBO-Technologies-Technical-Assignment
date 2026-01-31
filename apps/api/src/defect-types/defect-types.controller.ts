import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeviceIdGuard } from '../common/auth/device-id.guard';
import { DEFECT_TYPES } from './defect-types.constants';

@ApiTags('defect-types')
@ApiSecurity('device-id')
@UseGuards(DeviceIdGuard)
@Controller('defect-types')
export class DefectTypesController {
  @Get()
  list() {
    return DEFECT_TYPES;
  }
}
