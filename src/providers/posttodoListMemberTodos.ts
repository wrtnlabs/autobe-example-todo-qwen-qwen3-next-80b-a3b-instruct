import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";
import { MemberPayload } from "../decorators/payload/MemberPayload";

/**
 * Create a new todo item for the authenticated user.
 *
 * This operation creates a new todo item for the authenticated user with a
 * specified title. The system enforces business rules that require todo item
 * titles to be between 1 and 255 characters and not empty or whitespace-only.
 * The system automatically assigns the authenticated user as the owner and sets
 * default values for status and timestamps according to business requirements.
 *
 * When a valid title is provided, the system creates a new record in the
 * todo_list_todos table with the following automatic assignments:
 *
 * - The todo_list_member_id is set to the authenticated user's ID
 * - The status is set to 'active' by default
 * - The created_at timestamp is set to the current time in Asia/Seoul timezone
 * - The updated_at timestamp is set to the same value as created_at
 * - A unique UUID is generated for the id field
 *
 * If the title violates the business rules (empty, whitespace-only, or exceeds
 * 255 characters), the system rejects the request with an appropriate error
 * response without creating any database record, ensuring data integrity.
 *
 * The system follows the security principle of data ownership, automatically
 * associating the new todo item with the authenticated user and preventing any
 * association with other users. This implementation allows for independent task
 * management without any collaboration features as specified in the
 * requirements.
 *
 * The operation returns the complete created todo item including all fields,
 * confirming successful creation to the client. The response includes the
 * generated UUID, title, status, and timestamps, enabling the client to
 * immediately display the new task in the user interface.
 *
 * @param props - Request properties
 * @param props.member - The authenticated member making the request
 * @param props.body - The title of the new todo item (1-255 characters)
 * @returns The newly created todo item with all system-assigned fields
 * @throws {Error} When title is empty or exceeds 255 characters (handled by API
 *   layer)
 */
export async function posttodoListMemberTodos(props: {
  member: MemberPayload;
  body: ITodoListTodo.ICreate;
}): Promise<ITodoListTodo> {
  const { member, body } = props;
  const now = toISOStringSafe(new Date());

  const todo = await MyGlobal.prisma.todo_list_todos.create({
    data: {
      id: v4() as string & tags.Format<"uuid">,
      todo_list_member_id: member.id,
      title: body.title,
      status: "active",
      created_at: now,
      updated_at: now,
    },
  });

  return todo;
}
