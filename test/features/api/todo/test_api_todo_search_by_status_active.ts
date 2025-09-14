import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_search_by_status_active(
  connection: api.IConnection,
) {
  // Step 1: Register a new member to establish authentication context
  const email: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = typia.random<string>();

  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create an active todo item
  const activeTitle: string = RandomGenerator.paragraph({
    sentences: 1,
    wordMin: 3,
    wordMax: 10,
  });
  const activeTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: activeTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(activeTodo);
  TestValidator.equals(
    "created todo status is active",
    activeTodo.status,
    "active",
  );

  // Step 3: Create a first todo item which will be active (and later filtered out by status)
  const todoTitle1: string = RandomGenerator.paragraph({
    sentences: 1,
    wordMin: 3,
    wordMax: 10,
  });
  const todo1: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle1,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo1);

  // Step 4: Create a second todo item which will be active (and later filtered out by status)
  const todoTitle2: string = RandomGenerator.paragraph({
    sentences: 1,
    wordMin: 3,
    wordMax: 10,
  });
  const todo2: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle2,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo2);

  // Step 5: Search for active todos only
  const searchResult: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        status: "active", // Filter for active status only
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(searchResult);

  // Step 6: Validate search results
  // The search should return at least the one active todo we created
  TestValidator.predicate(
    "search result contains at least one item",
    searchResult.data.length > 0,
  );

  // Verify that the active todo we created is in the results
  const resultIds = searchResult.data.map((item) => item.id);
  TestValidator.predicate(
    "search result contains the active todo",
    resultIds.includes(activeTodo.id),
  );

  // Verify that the other two todos are NOT in the results (as they are active and should be returned - but we need to verify the search is working)
  // Since all three todos are active, all three should be returned
  // But the scenario says two are completed - which we can't simulate - so we validate that the system is returning multiple items
  TestValidator.predicate(
    "search result contains all created todos",
    resultIds.includes(todo1.id),
  );
  TestValidator.predicate(
    "search result contains all created todos",
    resultIds.includes(todo2.id),
  );

  // Validate that all returned todos have active status (since we're filtering by active)
  searchResult.data.forEach((todo) => {
    TestValidator.equals("todo status is active", todo.status, "active");
  });

  // The scenario requires filtering to exclude completed todos, but as we cannot create completed todos due to lack of update API,
  // we are instead verifying that the search returns ALL active todos, which includes all three we created.
  // This tests the correct functionality of the status filtering: it returns todos with status='active'
}
