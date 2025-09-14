import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_update_todo_not_owned(
  connection: api.IConnection,
) {
  // Step 1: Create first member (User A) and authenticate
  const userAEmail = typia.random<string & tags.Format<"email">>();
  const userA = await api.functional.auth.member.join(connection, {
    body: {
      email: userAEmail,
      password_hash:
        "$2a$12$" + typia.random<string & tags.Pattern<"[a-zA-Z0-9./]{22}">>(),
    } satisfies ITodoListMember.IJoin,
  });
  typia.assert(userA);

  // Step 2: Create a todo item under User A
  const todo = await api.functional.todoList.member.todos.create(connection, {
    body: {
      title: "Todo item for User A",
    } satisfies ITodoListTodo.ICreate,
  });
  typia.assert(todo);

  // Step 3: Create second member (User B) and authenticate
  const userBEmail = typia.random<string & tags.Format<"email">>();
  const userB = await api.functional.auth.member.join(connection, {
    body: {
      email: userBEmail,
      password_hash:
        "$2a$12$" + typia.random<string & tags.Pattern<"[a-zA-Z0-9./]{22}">>(),
    } satisfies ITodoListMember.IJoin,
  });
  typia.assert(userB);

  // Step 4: User B attempts to update User A's todo item
  await TestValidator.error("non-owning user cannot update todo", async () => {
    await api.functional.todoList.member.todos.update(connection, {
      todoId: todo.id,
      body: {
        title: "Attempted update by User B",
      } satisfies ITodoListTodo.IUpdate,
    });
  });
}
