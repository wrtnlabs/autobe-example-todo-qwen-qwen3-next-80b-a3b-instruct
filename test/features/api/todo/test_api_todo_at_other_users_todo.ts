import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_at_other_users_todo(
  connection: api.IConnection,
) {
  // 1. Create user A account and establish authentication context
  const userEmailA: string = typia.random<string & tags.Format<"email">>();
  const userA: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userEmailA,
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(userA);

  // 2. Create a todo item owned by user A
  const todoTitle: string = RandomGenerator.paragraph({ sentences: 3 });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);

  // 3. Create user B account and establish separate authentication context
  const userEmailB: string = typia.random<string & tags.Format<"email">>();
  const userB: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userEmailB,
        password_hash: "hashed_password_456",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(userB);

  // 4. User B attempts to access user A's todo item
  // This should return 404 Not Found (not 403 Forbidden) to enforce security-by-obscurity
  await TestValidator.error(
    "User B cannot access user A's todo item (404 Not Found)",
    async () => {
      await api.functional.todoList.member.todos.at(connection, {
        todoId: createdTodo.id,
      });
    },
  );
}
