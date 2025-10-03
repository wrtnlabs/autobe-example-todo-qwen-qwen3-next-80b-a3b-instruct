import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodoListTask";
import type { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_list_retrieval_empty(
  connection: api.IConnection,
) {
  // Step 1: Create user context via join
  const userContext: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(userContext);

  // Step 2: Retrieve todo list (should be empty)
  const todoList: IPageITodoListTodoListTask =
    await api.functional.todoList.todos.index(connection);
  typia.assert(todoList);

  // Step 3: Validate response structure
  TestValidator.equals(
    "pagination should show zero records",
    todoList.pagination.records,
    0,
  );
  TestValidator.equals(
    "pagination should show zero pages",
    todoList.pagination.pages,
    0,
  );
  TestValidator.equals("data array should be empty", todoList.data.length, 0);
  TestValidator.predicate("data should be an empty array", () =>
    ArrayUtil.has(todoList.data, () => false),
  );

  // Step 4: Validate structure of empty data array
  // Since data is empty, we verify the type is correct by checking it's an array of ITodoListTodoListTask
  // This is implicitly validated by typia.assert(todoList)
}
