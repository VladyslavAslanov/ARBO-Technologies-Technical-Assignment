import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, DefectType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import {
  ListRecordsQuery,
  RecordsSortBy,
  SortOrder,
} from './dto/list-records.query';
import path from 'path';
import fs from 'fs/promises';

type UploadedPhoto = {
  path: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
};

@Injectable()
export class RecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createRecord(
    userId: string,
    dto: CreateRecordDto,
    photos: UploadedPhoto[],
  ) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.treeDefectRecord.create({
        data: {
          userId,
          defectType: dto.defectType,
          severity: dto.severity,
          note: dto.note,
          lat: dto.lat,
          lng: dto.lng,
          locationAccuracy: dto.locationAccuracy,
          recordedAt: dto.recordedAt,
          createdAt: now,
        },
        select: {
          id: true,
          defectType: true,
          severity: true,
          note: true,
          lat: true,
          lng: true,
          locationAccuracy: true,
          recordedAt: true,
          createdAt: true,
        },
      });

      await tx.recordPhoto.createMany({
        data: photos.map((p) => ({
          recordId: record.id,
          path: p.path,
          mimeType: p.mimeType,
          originalName: p.originalName,
          sizeBytes: p.sizeBytes,
        })),
      });

      const full = await tx.treeDefectRecord.findUniqueOrThrow({
        where: { id: record.id },
        include: {
          photos: {
            select: {
              id: true,
              path: true,
              mimeType: true,
              sizeBytes: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return {
        ...full,
        recordedAt: this.toIso(full.recordedAt),
        createdAt: full.createdAt.toISOString(),
        photos: full.photos.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        })),
      };
    });
  }

  async listRecords(userId: string, query: ListRecordsQuery) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const days = query.days ?? 30;

    const defectTypes: DefectType[] | undefined = query.defectType
      ? Array.isArray(query.defectType)
        ? query.defectType
        : [query.defectType]
      : undefined;

    const createdAfter = new Date();
    createdAfter.setUTCDate(createdAfter.getUTCDate() - days);

    const where: Prisma.TreeDefectRecordWhereInput = {
      userId,
      createdAt: { gte: createdAfter },
    };

    if (defectTypes?.length) {
      where.defectType = { in: defectTypes };
    }

    if (query.minSeverity != null || query.maxSeverity != null) {
      where.severity = {};
      if (query.minSeverity != null) where.severity.gte = query.minSeverity;
      if (query.maxSeverity != null) where.severity.lte = query.maxSeverity;
    }

    if (query.hasLocation === true) {
      where.lat = { not: null };
    } else if (query.hasLocation === false) {
      where.lat = null;
    }

    // Map DTO enums to Prisma.SortOrder
    const prismaOrder: Prisma.SortOrder =
      query.order === SortOrder.asc ? 'asc' : 'desc';

    const orderBy: Prisma.TreeDefectRecordOrderByWithRelationInput[] =
      (query.sortBy ?? RecordsSortBy.createdAt) === RecordsSortBy.severity
        ? [{ severity: prismaOrder }, { id: 'asc' }]
        : [{ createdAt: prismaOrder }, { id: 'asc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.treeDefectRecord.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          photos: {
            take: 1,
            orderBy: { createdAt: 'asc' },
            select: { path: true },
          },
          _count: { select: { photos: true } },
        },
      }),
      this.prisma.treeDefectRecord.count({ where }),
    ] as const);

    const hasMore = offset + items.length < total;
    return {
      items: items.map((r) => ({
        id: r.id,
        defectType: r.defectType,
        severity: r.severity,
        note: r.note,
        lat: r.lat,
        lng: r.lng,
        locationAccuracy: r.locationAccuracy,
        recordedAt: this.toIso(r.recordedAt),
        createdAt: r.createdAt.toISOString(),
        coverPhotoPath: r.photos[0]?.path ?? null,
        photosCount: r._count.photos,
      })),
      total,
      limit,
      offset,
      days,
      hasMore,
    };
  }

  private toAbsoluteUploadPath(storedPath: string): string {
    // storedPath example: "/uploads/<filename>.jpg"
    const uploadDir = this.config.get<string>('UPLOAD_DIR') ?? './uploads';
    const filename = path.basename(storedPath); // prevent path traversal
    return path.resolve(process.cwd(), uploadDir, filename);
  }

  private toIso(d: Date | null | undefined): string | null {
    return d ? d.toISOString() : null;
  }

  async getRecordById(userId: string, id: string) {
    const record = await this.prisma.treeDefectRecord.findFirst({
      where: { id, userId },
      include: {
        photos: {
          select: {
            id: true,
            path: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    return {
      ...record,
      recordedAt: this.toIso(record.recordedAt),
      createdAt: record.createdAt.toISOString(),
      photos: record.photos.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
  async deleteRecord(userId: string, id: string) {
    // Load photo paths before DB deletion
    const record = await this.prisma.treeDefectRecord.findFirst({
      where: { id, userId },
      include: { photos: { select: { path: true } } },
    });

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    const filePaths = record.photos.map((p) =>
      this.toAbsoluteUploadPath(p.path),
    );

    // Delete DB rows (RecordPhoto is cascaded by relation)
    await this.prisma.treeDefectRecord.delete({
      where: { id: record.id },
    });

    // Best-effort file cleanup
    await Promise.all(
      filePaths.map(async (p) => {
        try {
          await fs.unlink(p);
        } catch {
          // Best-effort cleanup
        }
      }),
    );

    return { status: 'deleted' as const };
  }
}
