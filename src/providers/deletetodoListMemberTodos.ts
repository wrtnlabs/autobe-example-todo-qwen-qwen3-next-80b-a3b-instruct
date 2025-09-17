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

  await MyGlobal.prisma.todo_list_todos.deleteMany({
    where: {
      todo_list_member_id: member.id,
    },
  });
}
