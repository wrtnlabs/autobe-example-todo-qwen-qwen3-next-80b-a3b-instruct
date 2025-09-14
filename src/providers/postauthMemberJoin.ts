import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function postauthMemberJoin(props: {
  member: MemberPayload;
  body: ITodoListMember.IJoin;
}): Promise<ITodoListMember.IAuthorized> {
  const { email, password_hash } = props.body;

  // Generate UUID for new member
  const id = v4() as string & tags.Format<"uuid">;

  // Current time as ISO string
  const now = toISOStringSafe(new Date());

  // Create member record
  const created = await MyGlobal.prisma.todo_list_members.create({
    data: {
      id,
      email,
      password_hash,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    },
  });

  // Generate JWT tokens
  const accessToken = jwt.sign(
    {
      userId: created.id,
      email: created.email,
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
      issuer: "autobe",
    },
  );

  const refreshToken = jwt.sign(
    {
      userId: created.id,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Token expiration times
  const expired_at = toISOStringSafe(new Date(Date.now() + 3600000));
  const refreshable_until = toISOStringSafe(new Date(Date.now() + 604800000));

  // Return compliant IAuthorized structure
  return {
    id: created.id,
    token: {
      access: accessToken,
      refresh: refreshToken,
      expired_at,
      refreshable_until,
    },
  } satisfies ITodoListMember.IAuthorized;
}
