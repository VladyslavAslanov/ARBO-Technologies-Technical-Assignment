import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

import { DeviceIdGuard } from '../common/auth/device-id.guard';
import { UserId } from '../common/decorators/user-id.decorator';
import { CreateRecordDto } from './dto/create-record.dto';
import { ListRecordsQuery } from './dto/list-records.query';
import { RecordsService } from './records.service';

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanupFiles(files: Express.Multer.File[]) {
  for (const f of files) {
    try {
      fs.unlinkSync(f.path);
    } catch {
      // Best-effort cleanup
    }
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/heic':
      return '.heic';
    case 'image/heif':
      return '.heif';
    default:
      return '.bin';
  }
}

@ApiTags('records')
@ApiSecurity('device-id')
@UseGuards(DeviceIdGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['defectType', 'severity', 'photos'],
      properties: {
        defectType: { type: 'string' },
        severity: { type: 'number' },
        note: { type: 'string' },
        lat: { type: 'number' },
        lng: { type: 'number' },
        locationAccuracy: { type: 'number' },
        recordedAt: { type: 'string', format: 'date-time' },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      limits: { files: 10, fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
          const abs = path.resolve(process.cwd(), uploadDir);
          ensureDir(abs);
          cb(null, abs);
        },
        filename: (_req, file, cb) => {
          const ext = mimeToExt(file.mimetype);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
    }),
  )
  async create(
    @UserId() userId: string,
    @Body() body: CreateRecordDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length < 1) {
      throw new BadRequestException('At least one photo is required');
    }

    if (files.length > 10) {
      cleanupFiles(files);
      throw new BadRequestException('Too many photos');
    }

    const photos = files.map((f) => ({
      path: `/uploads/${path.basename(f.filename)}`,
      mimeType: f.mimetype,
      originalName: f.originalname,
      sizeBytes: f.size,
    }));

    try {
      return await this.records.createRecord(userId, body, photos);
    } catch (e) {
      cleanupFiles(files);
      throw e;
    }
  }

  @Get()
  async list(@UserId() userId: string, @Query() query: ListRecordsQuery) {
    return this.records.listRecords(userId, query);
  }
}
