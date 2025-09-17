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

  const memberId = v4() as string & tags.Format<"uuid">;
  const now = toISOStringSafe(new Date());

  const createdMember = await MyGlobal.prisma.todo_list_members.create({
    data: {
      id: memberId,
      email,
      password_hash,
      created_at: now,
      updated_at: now,
    },
  });

  const payload = {
    id: createdMember.id,
    type: "member",
  };

  const accessToken = jwt.sign(payload, MyGlobal.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
    issuer: "autobe",
  });

  const refreshToken = jwt.sign(
    {
      userId: createdMember.id,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  const accessTokenExpiresAt = toISOStringSafe(
    new Date(Date.now() + 1 * 60 * 60 * 1000),
  );
  const refreshTokenExpiresAt = toISOStringSafe(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return {
    id: createdMember.id,
    token: {
      access: accessToken,
      refresh: refreshToken,
      expired_at: accessTokenExpiresAt,
      refreshable_until: refreshTokenExpiresAt,
    },
  };
}
