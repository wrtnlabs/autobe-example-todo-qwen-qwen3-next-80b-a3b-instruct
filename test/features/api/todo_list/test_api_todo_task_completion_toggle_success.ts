import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_task_completion_toggle_success(
  connection: api.IConnection,
) {
  // Step 1: Establish session context by joining the TodoList application
  const session: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(session);

  // Step 2: Create a new task with a random title
  const taskTitle = RandomGenerator.paragraph({
    sentences: 3,
    wordMin: 3,
    wordMax: 8,
  });
  const createdTask: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: {
        title: taskTitle,
      } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(createdTask);
  TestValidator.equals(
    "task initially incomplete",
    createdTask.is_completed,
    false,
  );

  // Step 3: Toggle the task's completion status to true
  const toggledToTrue: ITodoListTodoListTask =
    await api.functional.todoList.todos.update(connection, {
      id: createdTask.id,
      body: {
        is_completed: true,
      } satisfies ITodoListTodoListTask.IUpdate,
    });
  typia.assert(toggledToTrue);
  TestValidator.equals(
    "task toggled to complete",
    toggledToTrue.is_completed,
    true,
  );

  // Step 4: Toggle the task's completion status back to false
  const toggledToFalse: ITodoListTodoListTask =
    await api.functional.todoList.todos.update(connection, {
      id: createdTask.id,
      body: {
        is_completed: false,
      } satisfies ITodoListTodoListTask.IUpdate,
    });
  typia.assert(toggledToFalse);
  TestValidator.equals(
    "task toggled back to incomplete",
    toggledToFalse.is_completed,
    false,
  );
}
