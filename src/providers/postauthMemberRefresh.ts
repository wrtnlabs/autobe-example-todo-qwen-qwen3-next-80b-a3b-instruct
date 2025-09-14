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
  const { refresh_token } = props.body;

  // Verify refresh token signature and issuer
  const decoded = jwt.verify(refresh_token, MyGlobal.env.JWT_SECRET_KEY, {
    issuer: "autobe",
  }) as { userId: string };

  // Validate user existence
  const member = await MyGlobal.prisma.todo_list_members.findUnique({
    where: {
      id: decoded.userId,
      deleted_at: null,
    },
  });

  if (!member) {
    throw new Error("User not found");
  }

  // Generate new access token with same payload structure
  const accessToken = jwt.sign(
    {
      userId: member.id,
      email: member.email,
      type: "member",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "30m",
      issuer: "autobe",
    },
  );

  // Generate new refresh token
  const newRefreshToken = jwt.sign(
    {
      userId: member.id,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Convert dates to ISO strings using toISOStringSafe
  const now = new Date();
  const accessExpiredAt: string & tags.Format<"date-time"> = toISOStringSafe(
    new Date(now.getTime() + 30 * 60 * 1000),
  );
  const refreshableUntil: string & tags.Format<"date-time"> = toISOStringSafe(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  // Return new token and user information
  return {
    id: member.id,
    token: {
      access: accessToken,
      refresh: newRefreshToken,
      expired_at: accessExpiredAt,
      refreshable_until: refreshableUntil,
    },
  };
}
