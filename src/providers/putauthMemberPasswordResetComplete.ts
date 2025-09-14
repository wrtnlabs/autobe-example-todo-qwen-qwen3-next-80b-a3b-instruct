import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function putauthMemberPasswordResetComplete(props: {
  member: MemberPayload;
  body: ITodoListMember.ICompletePasswordReset;
}): Promise<ITodoListMember.IAuthorized> {
  const { member, body } = props;

  const existingMember = await MyGlobal.prisma.todo_list_members.findUnique({
    where: {
      id: member.id,
    },
  });

  if (!existingMember) {
    throw new Error("Member not found");
  }

  if (existingMember.deleted_at !== null) {
    throw new Error("Member account is deleted");
  }

  const updatedMember = await MyGlobal.prisma.todo_list_members.update({
    where: {
      id: member.id,
    },
    data: {
      password_hash: body.new_password_hash,
      updated_at: toISOStringSafe(new Date()),
    },
  });

  const token = typia.random<IAuthorizationToken>();

  return {
    id: member.id,
    token,
  };
}
