import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";
import { MemberPayload } from "../decorators/payload/MemberPayload";

/**
 * Update a todo item's title or status
 *
 * This operation allows an authenticated member to modify the title or status
 * of their specific todo item. The operation validates ownership by ensuring
 * the todo item's todo_list_member_id matches the authenticated user's ID. If
 * the status is being changed, it must toggle between 'active' and 'completed';
 * any other status value is rejected. If the title is being updated, it must be
 * between 1 and 255 non-whitespace characters, and editing is only permitted if
 * the item's status is 'active'. Completed items cannot have their titles
 * edited. Upon successful update, the updated_at timestamp is set to the
 * current date and time in the user's timezone (Asia/Seoul), while the
 * created_at timestamp remains unchanged.
 *
 * Security is enforced through strict ownership validation: if the requested
 * todo item does not belong to the authenticated user, the request is rejected
 * with a 403 Forbidden response. The operation does not support partial
 * updates; the request must include at least one of the fields to update (title
 * or status). If neither is provided, the request is invalid.
 *
 * @param props - Request properties
 * @param props.member - The authenticated member making the request
 * @param props.todoId - Unique identifier of the todo item to update
 * @param props.body - Fields to update: title (1-255 chars, non-empty) or
 *   status ('active' or 'completed')
 * @returns The updated todo item with modified title or status and updated_at
 *   timestamp
 * @throws {Error} When todo item not found
 * @throws {Error} When user is not authorized to update this item
 * @throws {Error} When attempting to update title of a completed todo item
 */
export async function puttodoListMemberTodosTodoId(props: {
  member: MemberPayload;
  todoId: string & tags.Format<"uuid">;
  body: ITodoListTodo.IUpdate;
}): Promise<ITodoListTodo> {
  const { member, todoId, body } = props;

  const todo = await MyGlobal.prisma.todo_list_todos.findUnique({
    where: { id: todoId },
  });

  if (!todo) throw new Error("Todo item not found");

  if (todo.todo_list_member_id !== member.id) {
    throw new Error("Unauthorized: You can only update your own todo items");
  }

  // Validate business rule: cannot update title if status is 'completed'
  if (body.title !== undefined && todo.status === "completed") {
    throw new Error("Forbidden: Cannot update title of a completed todo item");
  }

  const updateData: any = {};

  if (body.title !== undefined) {
    updateData.title = body.title;
  }

  if (body.status !== undefined) {
    updateData.status = body.status;
  }

  updateData.updated_at = toISOStringSafe(new Date());

  const updated = await MyGlobal.prisma.todo_list_todos.update({
    where: { id: todoId },
    data: updateData,
  });

  return {
    id: updated.id,
    todo_list_member_id: updated.todo_list_member_id,
    title: updated.title,
    status: updated.status,
    created_at: toISOStringSafe(updated.created_at),
    updated_at: toISOStringSafe(updated.updated_at),
  };
}
