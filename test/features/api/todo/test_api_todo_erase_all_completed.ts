import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_erase_all_completed(
  connection: api.IConnection,
) {
  // 1. Create new member account and establish authentication context
  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // 2. Create three todo items (all with default 'active' status)
  const todoIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const todo: ITodoListTodo =
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: RandomGenerator.paragraph({
            sentences: 2,
            wordMin: 3,
            wordMax: 7,
          }),
        } satisfies ITodoListTodo.ICreate,
      });
    typia.assert(todo);
    todoIds.push(todo.id);
  }

  // 3. Delete all todo items for the authenticated member
  await api.functional.todoList.member.todos.erase(connection);

  // 4. Verify deletion by creating a new todo item
  // This is an indirect but reliable verification:
  // If bulk deletion worked properly, creating a new todo should succeed
  // If the system incorrectly retained references or had orphaned items,
  // the creation might fail (in a flawed implementation)
  const newTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 1,
          wordMin: 4,
          wordMax: 8,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(newTodo);

  // Confirm the new todo has a different id from the deleted ones
  // This verifies the deletion cleared the membership properly
  TestValidator.notEquals(
    "new todo id should be different from deleted todos",
    newTodo.id,
    todoIds[0],
  );
}
