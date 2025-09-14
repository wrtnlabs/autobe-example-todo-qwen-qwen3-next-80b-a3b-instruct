import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";
import { MemberPayload } from "../decorators/payload/MemberPayload";

/**
 * Retrieve a specific todo item by its unique identifier
 *
 * This operation returns complete details about a single task owned by the
 * authenticated user, including the title, status, creation timestamp, and last
 * updated timestamp.
 *
 * The system maintains strict data ownership by validating that the todo item's
 * todo_list_member_id matches the authenticated user's ID before returning any
 * data. If the todo item exists but belongs to a different user, the system
 * returns a 404 Not Found response without disclosing the existence of items
 * owned by other users, implementing a security-by-obscurity principle.
 *
 * The returned todo item includes all fields as defined in the todo_list_todos
 * Prisma schema: id, title, status, created_at, and updated_at. The status
 * field will be either 'active' or 'completed' as specified in the business
 * rules, and the timestamps are stored in Timestamptz format representing
 * Asia/Seoul timezone.
 *
 * This operation is typically used when a user needs to view detailed
 * information about a specific task, such as when navigating to a task detail
 * page from a list view. It supports high-performance database indexing on the
 * combination of todo_list_member_id and id to ensure sub-millisecond response
 * times even with large datasets.
 *
 * No request body is required as all information is provided through the path
 * parameter. The operation conforms strictly to the business rules that define
 * todo item properties and ensures that users can only access their own data.
 *
 * @param props - Request properties
 * @param props.member - The authenticated member making the request
 * @param props.todoId - Unique identifier of the target todo item
 * @returns Complete details of the requested todo item
 * @throws {Error} When todo item doesn't exist or doesn't belong to the
 *   authenticated member (404 Not Found)
 */
export async function gettodoListMemberTodosTodoId(props: {
  member: MemberPayload;
  todoId: string & tags.Format<"uuid">;
}): Promise<ITodoListTodo> {
  const { member, todoId } = props;

  const todo = await MyGlobal.prisma.todo_list_todos.findUniqueOrThrow({
    where: {
      id: todoId,
      todo_list_member_id: member.id,
    },
  });

  return {
    id: todo.id,
    todo_list_member_id: todo.todo_list_member_id,
    title: todo.title,
    status: todo.status,
    created_at: toISOStringSafe(todo.created_at),
    updated_at: toISOStringSafe(todo.updated_at),
  };
}
