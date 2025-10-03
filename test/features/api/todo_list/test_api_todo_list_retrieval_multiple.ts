import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodoListTask";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_list_retrieval_multiple(
  connection: api.IConnection,
) {
  // 1. Join to establish user context
  const userContext: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(userContext);

  // 2. Create three distinct tasks with different titles
  const task1Title = RandomGenerator.paragraph({ sentences: 3 });
  const task1: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: { title: task1Title } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(task1);
  TestValidator.equals("task 1 title matches", task1.title, task1Title);
  TestValidator.equals(
    "task 1 completed status is default false",
    task1.is_completed,
    false,
  );

  const task2Title = RandomGenerator.paragraph({ sentences: 3 });
  const task2: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: { title: task2Title } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(task2);
  TestValidator.equals("task 2 title matches", task2.title, task2Title);
  TestValidator.equals(
    "task 2 completed status is default false",
    task2.is_completed,
    false,
  );

  const task3Title = RandomGenerator.paragraph({ sentences: 3 });
  const task3: ITodoListTodoListTask =
    await api.functional.todoList.todos.create(connection, {
      body: { title: task3Title } satisfies ITodoListTodoListTask.ICreate,
    });
  typia.assert(task3);
  TestValidator.equals("task 3 title matches", task3.title, task3Title);
  TestValidator.equals(
    "task 3 completed status is default false",
    task3.is_completed,
    false,
  );

  // 3. Retrieve all tasks and verify they are returned in correct order
  const page: IPageITodoListTodoListTask =
    await api.functional.todoList.todos.index(connection);
  typia.assert(page);

  // Verify pagination metadata
  TestValidator.equals(
    "pagination records count matches number of created tasks",
    page.pagination.records,
    3,
  );
  TestValidator.equals("pagination initial page", page.pagination.current, 0);
  TestValidator.equals("pagination limit", page.pagination.limit, 10);
  TestValidator.equals("pagination pages", page.pagination.pages, 1);

  // Verify tasks are returned in creation order (earliest first)
  const tasks = page.data;
  TestValidator.equals("tasks array length", tasks.length, 3);
  TestValidator.equals(
    "first task title matches task1",
    tasks[0].title,
    task1Title,
  );
  TestValidator.equals("first task id matches task1", tasks[0].id, task1.id);
  TestValidator.equals(
    "first task completed status",
    tasks[0].is_completed,
    false,
  );

  TestValidator.equals(
    "second task title matches task2",
    tasks[1].title,
    task2Title,
  );
  TestValidator.equals("second task id matches task2", tasks[1].id, task2.id);
  TestValidator.equals(
    "second task completed status",
    tasks[1].is_completed,
    false,
  );

  TestValidator.equals(
    "third task title matches task3",
    tasks[2].title,
    task3Title,
  );
  TestValidator.equals("third task id matches task3", tasks[2].id, task3.id);
  TestValidator.equals(
    "third task completed status",
    tasks[2].is_completed,
    false,
  );
}
