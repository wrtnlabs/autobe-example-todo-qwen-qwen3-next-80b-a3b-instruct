import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function postauthMemberPasswordResetRequest(props: {
  member: MemberPayload;
  body: ITodoListMember.IRequestPasswordReset;
}): Promise<ITodoListMember.IResetInitiated> {
  const { email } = props.body;

  // Validate email format using typia
  typia.assert<string & tags.Format<"email">>(email);

  // Look up member by email in todo_list_members table
  const member = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      email,
      deleted_at: null,
    },
  });

  // For security, we never reveal if email exists
  // Return success response with the submitted email regardless
  return {
    email,
  };
}
