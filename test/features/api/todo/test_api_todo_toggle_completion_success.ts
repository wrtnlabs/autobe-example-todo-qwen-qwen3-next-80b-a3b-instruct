import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_toggle_completion_success(
  connection: api.IConnection,
) {
  // Step 1: Establish user session context by joining
  const userAuth: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(userAuth);

  // Step 2: Create a new task with initial incomplete status
  const taskTitle = RandomGenerator.paragraph({ sentences: 3 });
  const createdTask: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: {
        title: taskTitle,
      } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(createdTask);
  TestValidator.equals(
    "created task has correct title",
    createdTask.title,
    taskTitle,
  );
  TestValidator.equals(
    "created task starts as incomplete",
    createdTask.is_completed,
    false,
  );

  // Step 3: Toggle task completion status to true
  const toggleToComplete: ITodoListTodoListTask =
    await api.functional.todoList.todos.update(connection, {
      id: createdTask.id,
      body: {
        is_completed: true,
      } satisfies ITodoListTodoListTask.IUpdate,
    });
  typia.assert(toggleToComplete);
  TestValidator.equals(
    "task toggled to complete",
    toggleToComplete.is_completed,
    true,
  );
  TestValidator.equals(
    "task ID preserved after toggle",
    toggleToComplete.id,
    createdTask.id,
  );
  TestValidator.equals(
    "task title preserved after toggle",
    toggleToComplete.title,
    createdTask.title,
  );

  // Step 4: Toggle task completion status back to false
  const toggleToIncomplete: ITodoListTodoListTask =
    await api.functional.todoList.todos.update(connection, {
      id: createdTask.id,
      body: {
        is_completed: false,
      } satisfies ITodoListTodoListTask.IUpdate,
    });
  typia.assert(toggleToIncomplete);
  TestValidator.equals(
    "task toggled back to incomplete",
    toggleToIncomplete.is_completed,
    false,
  );
  TestValidator.equals(
    "task ID preserved after second toggle",
    toggleToIncomplete.id,
    createdTask.id,
  );
  TestValidator.equals(
    "task title preserved after second toggle",
    toggleToIncomplete.title,
    createdTask.title,
  );
}
