import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function posttodoListMemberTodos(props: {
  member: MemberPayload;
  body: ITodoListTodo.ICreate;
}): Promise<ITodoListTodo> {
  const { member, body } = props;

  const created = await MyGlobal.prisma.todo_list_todos.create({
    data: {
      id: v4(),
      todo_list_member_id: member.id,
      title: body.title,
      status: "active",
      created_at: toISOStringSafe(new Date()),
      updated_at: toISOStringSafe(new Date()),
    } satisfies ITodoListTodo,
  });

  return created;
}
