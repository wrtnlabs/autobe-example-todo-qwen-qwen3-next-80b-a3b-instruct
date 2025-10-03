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

export async function postAuthUserJoin(props: {
  user: UserPayload;
}): Promise<ITodoListUser.IAuthorized> {
  /**
   * Creates temporary session context for single-user TodoList application
   * without authentication or user records.
   *
   * This registration (join) operation creates a temporary token-based context
   * for the single user of the TodoList application. The system is explicitly
   * designed without user authentication, accounts, or identity management, so
   * there are no user records, login credentials, or server-side session
   * storage in the Prisma schema—the only persistent entity is the
   * todo_list_task table containing id, title, and is_completed fields.
   * Therefore, this join operation does not collect user credentials or
   * personal data— it merely creates a session context for local persistence.
   *
   * The operation returns a token that correlates with a local storage key,
   * allowing the client to retrieve and modify tasks. Since no user table
   * exists in Prisma schema, no user-specific data is stored—only task data in
   * todo_list_task. The token is cryptographically generated and stored
   * client-side, not server-side, satisfying the requirement that all
   * operations occur under implicit user context.
   *
   * This join operation enables the system to meet the requirement that task
   * data persists between sessions without any authentication or syncing
   * mechanism. Since the schema has no fields for user_id, email, password, or
   * any authentication metadata, the session token is the only artifact needed
   * to maintain state locally. This operation is non-identity-based; it doesn't
   * create a user identity—it creates a persistent local context.
   *
   * Security is maintained through token secrecy on the client side, as there
   * is no server-side storage of tokens or user data. This approach aligns
   * completely with the Prisma schema which lacks any authentication columns.
   *
   * @param props - Request properties
   * @param props.user - The authenticated user making the request
   * @returns Temporary session context with access and refresh tokens for
   *   client-side state persistence
   * @throws {HttpException} When token generation fails
   */
  const userId: string & tags.Format<"uuid"> = props.user.id;

  // Generate access token with 1-hour expiration
  const accessToken = jwt.sign(
    {
      userId: userId,
      type: "user",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
      issuer: "autobe",
    },
  );

  // Generate refresh token with 7-day expiration
  const refreshToken = jwt.sign(
    {
      userId: userId,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Create expiry dates using toISOStringSafe to ensure proper format
  const now: string & tags.Format<"date-time"> = toISOStringSafe(new Date());
  const expiredAt: string & tags.Format<"date-time"> = toISOStringSafe(
    new Date(Date.now() + 3600000),
  ); // 1 hour from now
  const refreshableUntil: string & tags.Format<"date-time"> = toISOStringSafe(
    new Date(Date.now() + 604800000),
  ); // 7 days from now

  return {
    id: userId,
    token: {
      access: accessToken,
      refresh: refreshToken,
      expired_at: expiredAt,
      refreshable_until: refreshableUntil,
    },
  };
}
