import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { RequestWithUser } from "./request-with-user";

@Injectable()
export class DeviceIdGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const raw = req.headers["x-device-id"];
    const deviceId = Array.isArray(raw) ? raw[0] : raw;

    if (
      !deviceId ||
      typeof deviceId !== "string" ||
      deviceId.trim().length === 0
    ) {
      throw new BadRequestException("Missing x-device-id header");
    }

    if (deviceId.length > 128) {
      throw new BadRequestException("Invalid x-device-id header");
    }

    const user = await this.prisma.user.upsert({
      where: { deviceId },
      update: {},
      create: { deviceId },
      select: { id: true },
    });

    req.userId = user.id;
    req.deviceId = deviceId;

    return true;
  }
}
