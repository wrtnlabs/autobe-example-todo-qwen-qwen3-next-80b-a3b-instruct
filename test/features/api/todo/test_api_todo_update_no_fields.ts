import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_no_fields(
  connection: api.IConnection,
) {
  // Step 1: Authenticate and create a new member account
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash:
          "$2b$12$C4nt9p3jPgJlJvEwQZVUvu/wGT3QsspjxsWO-mapTI8F6THwDil3a", // Valid bcrypt hash structure
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a todo item owned by the authenticated member
  const todoTitle: string = RandomGenerator.name(1); // Single word title (1-255 chars)
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);

  // Step 3: Attempt to update the todo item with an empty request body
  await TestValidator.error("empty update body should fail", async () => {
    await api.functional.todoList.member.todos.update(connection, {
      todoId: todo.id,
      body: {} satisfies ITodoListTodo.IUpdate,
    });
  });
}
