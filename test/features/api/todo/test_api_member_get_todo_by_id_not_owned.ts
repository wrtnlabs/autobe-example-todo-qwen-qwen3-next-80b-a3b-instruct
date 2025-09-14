import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_get_todo_by_id_not_owned(
  connection: api.IConnection,
) {
  // Step 1: Create first member account (User A)
  const userEmailA: string = typia.random<string & tags.Format<"email">>();
  const passwordHashA: string = "hashed_password_123";
  const memberA: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userEmailA,
        password_hash: passwordHashA,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(memberA);

  // Step 2: Create a todo item for User A
  const todoTitleA: string = RandomGenerator.paragraph({ sentences: 3 });
  const todoA: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitleA,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todoA);
  const todoId: string = todoA.id;

  // Step 3: Create second member account (User B)
  const userEmailB: string = typia.random<string & tags.Format<"email">>();
  const passwordHashB: string = "hashed_password_456";
  const memberB: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userEmailB,
        password_hash: passwordHashB,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(memberB);

  // Step 4: Switch authentication context to User B by authenticating User B
  // This updates the connection's Authorization header with User B's token
  await api.functional.auth.member.join(connection, {
    body: {
      email: userEmailB,
      password_hash: passwordHashB,
    } satisfies ITodoListMember.IJoin,
  });

  // Step 5: Attempt to retrieve todo item belonging to User A as User B
  // This should result in a 404 Not Found response, not a 403 Forbidden,
  // to prevent information disclosure about the existence of the todo item.
  await TestValidator.error(
    "Non-owner member cannot retrieve todo item (404 Not Found)",
    async () => {
      await api.functional.todoList.member.todos.at(connection, {
        todoId: todoId,
      });
    },
  );
}
