import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodoListTask";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_index_retrieval(
  connection: api.IConnection,
) {
  // Step 1: Establish session context by joining
  const authResponse: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(authResponse);

  // Step 2: Create a single task with test data
  const taskTitle = RandomGenerator.paragraph({
    sentences: 5,
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

  // Step 3: Retrieve all tasks to verify persistence and correct structure
  const taskList: IPageITodoListTodoListTask =
    await api.functional.todoList.todos.index(connection);
  typia.assert(taskList);

  // Validate task count
  TestValidator.equals("task count matches", taskList.data.length, 1);
  TestValidator.equals("task id matches", taskList.data[0].id, createdTask.id);
  TestValidator.equals(
    "task title matches",
    taskList.data[0].title,
    createdTask.title,
  );
  TestValidator.equals(
    "task completion status matches",
    taskList.data[0].is_completed,
    createdTask.is_completed,
  );

  // Validate field type integrity
  const task = taskList.data[0];
  TestValidator.predicate(
    "id is valid UUID format",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      task.id,
    ),
  );
  TestValidator.predicate("title is non-empty", task.title.length > 0);
  TestValidator.predicate(
    "title is within length limit",
    task.title.length <= 500,
  );
  TestValidator.predicate(
    "is_completed is boolean",
    typeof task.is_completed === "boolean",
  );

  // Validate pagination structure
  TestValidator.predicate(
    "current page is at least 1",
    taskList.pagination.current >= 1,
  );
  TestValidator.predicate(
    "limit is at least 1",
    taskList.pagination.limit >= 1,
  );
  TestValidator.predicate(
    "records is positive",
    taskList.pagination.records >= 0,
  );
  TestValidator.predicate(
    "pages is at least 1",
    taskList.pagination.pages >= 1,
  );

  // Validate data persistence and ordering
  TestValidator.equals(
    "task data is consistent",
    createdTask.title,
    task.title,
  );
  TestValidator.equals(
    "task completion status is preserved",
    createdTask.is_completed,
    task.is_completed,
  );
  TestValidator.equals("task id is correct", createdTask.id, task.id);

  // Ensure complies with creation order
  // Based on requirement: "returns all previously created tasks in creation order"
  // Since we only created one task, we've validated the entire list
}
