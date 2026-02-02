import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiSecurity,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";
import { randomUUID } from "crypto";

import { DeviceIdGuard } from "../common/auth/device-id.guard";
import { UserId } from "../common/decorators/user-id.decorator";
import { CreateRecordDto } from "./dto/create-record.dto";
import { ListRecordsQuery } from "./dto/list-records.query";
import { RecordsService } from "./records.service";
import { RecordDetailResponseDto } from "apps/api/src/records/dto/responses/record-detail-response.dto";
import { ListRecordsResponseDto } from "apps/api/src/records/dto/responses/list-records-response.dto";

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
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    default:
      return ".bin";
  }
}

@ApiTags("records")
@ApiSecurity("device-id")
@UseGuards(DeviceIdGuard)
@Controller("records")
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["defectType", "severity", "photos"],
      properties: {
        defectType: { type: "string" },
        severity: { type: "number" },
        note: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
        locationAccuracy: { type: "number" },
        recordedAt: { type: "string", format: "date-time" },
        photos: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor("photos", 10, {
      limits: { files: 10, fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/heic", "image/heif"];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException("Unsupported file type"), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
          const abs = path.resolve(process.cwd(), uploadDir);
          ensureDir(abs);
          cb(null, abs);
        },
        filename: (_req, file, cb) => {
          const ext = mimeToExt(file.mimetype);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
    })
  )
  @Post()
  @ApiCreatedResponse({ type: RecordDetailResponseDto })
  async create(
    @UserId() userId: string,
    @Body() body: CreateRecordDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length < 1) {
      throw new BadRequestException("At least one photo is required");
    }

    if (files.length > 10) {
      cleanupFiles(files);
      throw new BadRequestException("Too many photos");
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
  @ApiOkResponse({ type: ListRecordsResponseDto })
  @ApiQuery({ name: "days", required: false, enum: [7, 14, 30] })
  @ApiQuery({
    name: "limit",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100 },
  })
  @ApiQuery({
    name: "offset",
    required: false,
    schema: { type: "integer", minimum: 0 },
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["createdAt", "severity"],
  })
  @ApiQuery({ name: "order", required: false, enum: ["asc", "desc"] })
  @ApiQuery({
    name: "minSeverity",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 5 },
  })
  @ApiQuery({
    name: "maxSeverity",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 5 },
  })
  @ApiQuery({
    name: "hasLocation",
    required: false,
    schema: { type: "boolean" },
  })
  @ApiQuery({
    name: "defectType",
    required: false,
    isArray: true,
    description: "Repeatable query param: ?defectType=A&defectType=B",
  })
  async list(@UserId() userId: string, @Query() query: ListRecordsQuery) {
    return this.records.listRecords(userId, query);
  }

  @Get(":id")
  @ApiOkResponse({ type: RecordDetailResponseDto })
  async getById(
    @UserId() userId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ) {
    return this.records.getRecordById(userId, id);
  }

  @Delete(":id")
  async remove(
    @UserId() userId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string
  ) {
    return this.records.deleteRecord(userId, id);
  }
}
