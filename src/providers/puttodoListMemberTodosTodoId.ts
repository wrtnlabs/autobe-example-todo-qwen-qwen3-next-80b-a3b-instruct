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
 * with a 404 Not Found response. The operation does not support partial
 * updates; the request must include at least one of the fields to update (title
 * or status). If neither is provided, the request is invalid.
 *
 * This operation is essential for personal task management, enabling users to
 * refine their tasks' details or mark completion. It preserves data integrity
 * by preventing editing of completed tasks and ensures users can only modify
 * their own data in compliance with the system's single-user ownership model.
 *
 * @param props - Request properties
 * @param props.member - The authenticated member making the request
 * @param props.todoId - Unique identifier of the todo item to update
 * @param props.body - Fields to update for the todo item: title (1-255 chars,
 *   non-empty) or status ('active' or 'completed')
 * @returns The updated todo item with modified title or status and updated_at
 *   timestamp
 * @throws {Error} When todo item is not found or doesn't belong to
 *   authenticated member
 * @throws {Error} When title update is attempted on completed todo
 * @throws {Error} When no update fields are provided (both title and status are
 *   undefined)
 */
export async function puttodoListMemberTodosTodoId(props: {
  member: MemberPayload;
  todoId: string & tags.Format<"uuid">;
  body: ITodoListTodo.IUpdate;
}): Promise<ITodoListTodo> {
  const { member, todoId, body } = props;

  // Fetch the todo item
  const todo = await MyGlobal.prisma.todo_list_todos.findUnique({
    where: { id: todoId },
  });

  // If todo doesn't exist, throw 404 (security-by-obscurity: don't leak existence)
  if (!todo) throw new Error("Todo not found");

  // Verify ownership: todo_list_member_id must match member.id
  if (todo.todo_list_member_id !== member.id) throw new Error("Todo not found");

  // Validate update constraints: at least one field must be provided
  if (body.title === undefined && body.status === undefined) {
    throw new Error("At least one of title or status must be provided");
  }

  // Check business rule: cannot update title when status is 'completed'
  if (body.title !== undefined && todo.status === "completed") {
    throw new Error("Cannot update title of a completed todo");
  }

  // Get current timestamp
  const now: string & tags.Format<"date-time"> = toISOStringSafe(new Date());

  // Prepare update data
  const updated = await MyGlobal.prisma.todo_list_todos.update({
    where: { id: todoId },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      status: body.status !== undefined ? body.status : undefined,
      updated_at: now,
    },
  });

  // Return the updated todo item
  // All date fields: use the ones that came from DB or the one we just set
  return {
    id: updated.id,
    todo_list_member_id: updated.todo_list_member_id,
    title: updated.title,
    status: updated.status,
    created_at: updated.created_at, // Already string from DB
    updated_at: updated.updated_at, // Already string from DB
  };
}
