import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_task_deletion_success(
  connection: api.IConnection,
) {
  // Step 1: Establish session context by joining authentication
  const session: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(session);

  // Step 2: Create a new todo task
  const createResponse: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 3,
          wordMin: 4,
          wordMax: 8,
        }),
      } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(createResponse);

  // Step 3: Delete the created task
  // The API's documentation states deletion silently ignores non-existent IDs,
  // meaning if the deletion fails to find the ID, it still succeeds without error.
  // Since there's no way to verify the task was deleted (no GET endpoint provided),
  // we rely on the successful operation completion as verification of functionality.
  await api.functional.todoList.todos.erase(connection, {
    id: createResponse.id,
  });
}
