import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_creation_with_long_title(
  connection: api.IConnection,
) {
  // Step 1: Establish user context via join
  const user: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(user);

  // Step 2: Create a title with exactly 501 characters
  const longTitle = RandomGenerator.alphabets(501); // Produces 501 lowercase letters

  // Step 3: Create the todo task with the long title
  const createdTask: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: {
        title: longTitle,
      } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(createdTask);

  // Step 4: Validate the returned task
  // The title should be truncated to 500 characters
  TestValidator.equals(
    "created task title is truncated to 500 characters",
    createdTask.title.length,
    500,
  );
  TestValidator.equals(
    "created task title matches first 500 characters of input",
    createdTask.title,
    longTitle.substring(0, 500),
  );
  TestValidator.equals(
    "is_completed is false by default",
    createdTask.is_completed,
    false,
  );
}
