import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import typia, { tags } from "typia";
import { v4 } from "uuid";
import { MyGlobal } from "../MyGlobal";
import { PasswordUtil } from "../utils/passwordUtil";
import { toISOStringSafe } from "../utils/toISOStringSafe";

import { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";
import { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import { UserPayload } from "../decorators/payload/UserPayload";

export async function postAuthUserRefresh(props: {
  user: UserPayload;
}): Promise<ITodoListUser.IAuthorized> {
  // Generate new session context ID
  const newId: string & tags.Format<"uuid"> = v4();

  // Generate new expiration timestamps
  const now = new Date();
  const expiredAt: string & tags.Format<"date-time"> = toISOStringSafe(now);
  const refreshableUntil: string & tags.Format<"date-time"> = toISOStringSafe(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  ); // 7 days from now

  // Generate new access token
  const accessToken = jwt.sign(
    { userId: newId, type: "user" },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
      issuer: "autobe",
    },
  );

  // Generate new refresh token
  const refreshToken = jwt.sign(
    { userId: newId, tokenType: "refresh" },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Build response
  const token: IAuthorizationToken = {
    access: accessToken,
    refresh: refreshToken,
    expired_at: expiredAt,
    refreshable_until: refreshableUntil,
  };

  return {
    id: newId,
    token,
  };
}
