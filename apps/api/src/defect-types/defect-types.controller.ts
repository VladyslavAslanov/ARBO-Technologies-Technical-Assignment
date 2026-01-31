import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeviceIdGuard } from '../common/auth/device-id.guard';
import { DEFECT_TYPES } from './defect-types.constants';
import { ApiOkResponse } from '@nestjs/swagger';
import { DefectTypeItemDto } from './dto/defect-type-item.dto';

@ApiTags('defect-types')
@ApiSecurity('device-id')
@UseGuards(DeviceIdGuard)
@Controller('defect-types')
export class DefectTypesController {
  @ApiOkResponse({ type: DefectTypeItemDto, isArray: true })
  @Get()
  list() {
    return DEFECT_TYPES;
  }
}
