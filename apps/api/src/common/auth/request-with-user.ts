import type { Request } from "express";

export type RequestWithUser = Request & {
  userId?: string;
  deviceId?: string;
};
