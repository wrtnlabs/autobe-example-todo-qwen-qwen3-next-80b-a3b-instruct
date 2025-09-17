import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function postauthMemberRefresh(props: {
  member: MemberPayload;
  body: ITodoListMember.IRefresh;
}): Promise<ITodoListMember.IAuthorized> {
  const { refresh_token } = body;

  // Validate refresh token signature and issuer
  let decoded: any;
  try {
    decoded = jwt.verify(refresh_token, MyGlobal.env.JWT_SECRET_KEY, {
      issuer: "autobe",
    });
  } catch (error) {
    throw new Error("Invalid refresh token");
  }

  // Verify user exists and is active
  const user = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      id: decoded.userId,
      deleted_at: null,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate new access token with same payload structure as login
  const newAccessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "30m",
      issuer: "autobe",
    },
  );

  // Generate new refresh token with 7-day expiration (token rotation)
  const newRefreshToken = jwt.sign(
    {
      userId: user.id,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Calculate expiration times using toISOStringSafe
  const now = toISOStringSafe(new Date());
  const expiredAt = toISOStringSafe(new Date(Date.now() + 30 * 60 * 1000));
  const refreshableUntil = toISOStringSafe(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return {
    id: user.id as string & tags.Format<"uuid">,
    token: {
      access: newAccessToken,
      refresh: newRefreshToken,
      expired_at: expiredAt,
      refreshable_until: refreshableUntil,
    },
  };
}
