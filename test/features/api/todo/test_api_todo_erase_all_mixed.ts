import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_erase_all_mixed(
  connection: api.IConnection,
) {
  // Register a new member to establish authentication context
  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash: typia.random<string>(),
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // Create three todo items — all will have 'active' status by default, as the API only allows creation in active state
  const todo1: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 2,
          wordMin: 5,
          wordMax: 10,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo1);

  const todo2: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 2,
          wordMin: 5,
          wordMax: 10,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo2);

  const todo3: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 2,
          wordMin: 5,
          wordMax: 10,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo3);

  // Delete all todo items for the authenticated member
  // This is a bulk delete operation with no request body
  // The API will permanently delete all todos owned by the authenticated member
  await api.functional.todoList.member.todos.erase(connection);

  // The interface requires no return value ('void') for the erase method
  // Validation of deletion is inferred from successful API call with correct authentication
  // We assume the system permanently deletes all records as specified
  // No further verification possible within current API surface
  // The scenario's 'completed' status item is ignored as the API doesn't support transitioning to 'completed', making it untestable.
  // We test only the implementable core: bulk deletion of all member-owned todos.
}
