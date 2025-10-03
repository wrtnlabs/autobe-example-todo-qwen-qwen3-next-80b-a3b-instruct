import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_task_creation_with_whitespace_only_title(
  connection: api.IConnection,
) {
  // Step 1: Establish temporary session context for the single-user TodoList application
  const session: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(session);

  // Step 2: Test the creation of a todo task with whitespace-only title
  // The system must reject this request and not create any task
  await TestValidator.error(
    "creation of todo with whitespace-only title should fail",
    async () => {
      await api.functional.todoList.todos.create(connection, {
        body: {
          title: "   ", // Pure whitespace - should be rejected by business rule
        } satisfies ITodoListTodoListTask.ICreate,
      });
    },
  );
}
