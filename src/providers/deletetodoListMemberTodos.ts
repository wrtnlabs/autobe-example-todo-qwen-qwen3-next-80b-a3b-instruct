import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function deletetodoListMemberTodos(props: {
  member: MemberPayload;
}): Promise<void> {
  const { member } = props;

  // Verify member ID is provided
  if (!member.id) {
    throw new Error("No member ID provided");
  }

  // Perform hard delete of all todo items for this member
  await MyGlobal.prisma.todo_list_todos.deleteMany({
    where: {
      todo_list_member_id: member.id,
    },
  });
}
