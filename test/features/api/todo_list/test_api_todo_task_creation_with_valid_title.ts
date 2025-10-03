import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_task_creation_with_valid_title(
  connection: api.IConnection,
) {
  // Step 1: Establish session context by joining
  const user: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(user);

  // Step 2: Create a todo task with a valid non-empty title
  const title = RandomGenerator.paragraph({
    sentences: 1,
    wordMin: 5,
    wordMax: 20,
  });
  const task: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: {
        title,
      } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(task);

  // Step 3: Validate the created task has the expected properties
  TestValidator.equals("task title matches input", task.title, title);
  TestValidator.equals(
    "task should be initially incomplete",
    task.is_completed,
    false,
  );
}
