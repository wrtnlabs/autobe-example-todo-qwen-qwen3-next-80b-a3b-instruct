import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function putauthMemberPasswordUpdate(props: {
  member: MemberPayload;
  body: ITodoListMember.IUpdatePassword;
}): Promise<ITodoListMember> {
  const { member, body } = props;

  // Fetch the user with ownership verification
  const user = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      id: member.id,
      deleted_at: null,
    },
  });

  // Validate ownership and password
  if (!user) throw new Error("Unauthorized");
  if (user.password_hash !== body.current_password_hash)
    throw new Error("Unauthorized");

  // Update password and timestamp - inline data object
  await MyGlobal.prisma.todo_list_members.update({
    where: { id: member.id },
    data: {
      password_hash: body.new_password_hash,
      updated_at: toISOStringSafe(new Date()),
    },
  });

  // Return fully hydrated user object with correct date types
  return {
    id: user.id,
    email: user.email,
    password_hash: body.new_password_hash,
    created_at: toISOStringSafe(user.created_at),
    updated_at: toISOStringSafe(new Date()),
    deleted_at: user.deleted_at,
  } satisfies ITodoListMember;
}
