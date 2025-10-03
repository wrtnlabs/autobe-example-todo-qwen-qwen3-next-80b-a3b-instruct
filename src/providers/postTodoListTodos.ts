import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import typia, { tags } from "typia";
import { v4 } from "uuid";
import { MyGlobal } from "../MyGlobal";
import { PasswordUtil } from "../utils/passwordUtil";
import { toISOStringSafe } from "../utils/toISOStringSafe";

import { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";

export async function postTodoListTodos(props: {
  body: ITodoListTodoListTask.ICreate;
}): Promise<ITodoListTodoListTask> {
  /**
   * Create a new todo task with the provided text content.
   *
   * This operation inserts a new record into the todo_list_task table from the
   * Prisma schema. The title field must contain at least one non-whitespace
   * character and be truncated to 500 characters if longer, as specified in the
   * schema description. Leading and trailing whitespace is trimmed, and
   * internal whitespace is preserved. The is_completed field is automatically
   * set to false by default, as defined in the schema.
   *
   * The system rejects empty or whitespace-only inputs without creating a task,
   * as per the business requirements. This operation has no authentication
   * requirements since the Todo List application operates under a single
   * implicit user context with no user authentication or session management.
   *
   * The operation returns the newly created task with its generated id, title,
   * and is_completed state. The response includes only the fields defined in
   * the todo_list_task schema - id, title, and is_completed - with no
   * additional metadata, timestamps, or user identifiers.
   *
   * @param props - Request properties
   * @param props.body - Request body containing the task title for creation
   * @returns The newly created todo task containing id, title, and is_completed
   *   fields
   */
  const createdTask = await MyGlobal.prisma.todo_list_task.create({
    data: {
      id: v4() as string & tags.Format<"uuid">,
      title: props.body.title,
      is_completed: false,
    },
  });

  return {
    id: createdTask.id,
    title: createdTask.title,
    is_completed: createdTask.is_completed,
  };
}
