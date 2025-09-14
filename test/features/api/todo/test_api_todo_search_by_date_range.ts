import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_search_by_date_range(
  connection: api.IConnection,
) {
  // 1. Register new member to establish authentication context
  const memberEmail = typia.random<string & tags.Format<"email">>();
  const memberPasswordHash = typia.random<string>();

  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: memberPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create three todo items (system automatically sets created_at)
  // We'll create them sequentially with small delays to ensure different timestamps

  // First todo item (will be oldest)
  const firstTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: `First todo item ${RandomGenerator.name()}`,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(firstTodo);

  // Wait a moment to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Second todo item (will be middle)
  const secondTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: `Second todo item ${RandomGenerator.name()}`,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(secondTodo);

  // Wait a moment to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Third todo item (will be newest)
  const thirdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: `Third todo item ${RandomGenerator.name()}`,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(thirdTodo);

  // 3. Sort items by created_at to identify oldest and newest
  const todos = [firstTodo, secondTodo, thirdTodo];
  todos.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const oldestTodo = todos[0];
  const newestTodo = todos[2];

  // 4. Verify we have three distinct timestamps
  TestValidator.notEquals(
    "timestamps are distinct",
    oldestTodo.created_at,
    secondTodo.created_at,
  );
  TestValidator.notEquals(
    "timestamps are distinct",
    oldestTodo.created_at,
    thirdTodo.created_at,
  );
  TestValidator.notEquals(
    "timestamps are distinct",
    secondTodo.created_at,
    thirdTodo.created_at,
  );

  // 5. Search for todo items created after oldest item's timestamp and before newest item's timestamp
  // This should return all three items, but we want to test the filtering functionality
  // To validate filtering, we'll use the second item's timestamp as boundaries that exclude the oldest and include the other two

  // Use oldest item's created_at as created_before to exclude it
  // Use second item's created_at as created_after to exclude it (but include third)
  // This way we include only the newest item

  const createdAfter = secondTodo.created_at; // Include items created after second item (only third todo)
  const createdBefore = newestTodo.created_at; // Include items created before newest item (both second and third)

  const searchResult: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        created_after: createdAfter,
        created_before: createdBefore,
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(searchResult);

  // 6. Validate that only the newest item is returned
  TestValidator.equals("one item returned", searchResult.data.length, 1);
  TestValidator.equals(
    "returned item matches newest item",
    searchResult.data[0].id,
    thirdTodo.id,
  );

  // 7. Verify filtering logic works with multiple boundaries
  // Find items created after oldest and before newest (should return two items)
  const searchAllInRange: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        created_after: oldestTodo.created_at,
        created_before: newestTodo.created_at,
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(searchAllInRange);

  // Should include second and third items (not the oldest since created_after is oldest's timestamp)
  // We include items with created_at >= created_after and created_at <= created_before
  TestValidator.equals("two items returned", searchAllInRange.data.length, 2);

  // Verify returned items are second and third
  const returnedIds = searchAllInRange.data.map((item) => item.id);
  TestValidator.predicate(
    "contains second item",
    returnedIds.includes(secondTodo.id),
  );
  TestValidator.predicate(
    "contains third item",
    returnedIds.includes(thirdTodo.id),
  );
  TestValidator.predicate(
    "does not contain oldest item",
    !returnedIds.includes(oldestTodo.id),
  );
}
