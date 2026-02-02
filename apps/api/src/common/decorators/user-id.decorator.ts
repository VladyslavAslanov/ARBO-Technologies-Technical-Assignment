import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithUser } from "../auth/request-with-user";

export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!req.userId) {
      throw new Error("UserId is missing in request context");
    }
    return req.userId;
  }
);
