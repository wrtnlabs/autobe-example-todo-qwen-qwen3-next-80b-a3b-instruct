import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_other_users_todo(
  connection: api.IConnection,
) {
  // Step 1: User A registers and creates a todo item
  const userAEmail = typia.random<string & tags.Format<"email">>();
  const userAPasswordHash = typia.random<string>();
  const userA: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userAEmail,
        password_hash: userAPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(userA);

  const todoTitle = RandomGenerator.paragraph();
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);

  // Step 2: User B registers with a different account
  const userBEmail = typia.random<string & tags.Format<"email">>();
  const userBPasswordHash = typia.random<string>();
  const userB: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: userBEmail,
        password_hash: userBPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(userB);

  // Step 3: User B attempts to update User A's todo item (should return 404)
  await TestValidator.error(
    "user B cannot update user A's todo item (should return 404)",
    async () => {
      await api.functional.todoList.member.todos.update(connection, {
        todoId: createdTodo.id,
        body: {
          title: "Updated by user B",
        } satisfies ITodoListTodo.IUpdate,
      });
    },
  );
}
