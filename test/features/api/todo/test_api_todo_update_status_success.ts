import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_status_success(
  connection: api.IConnection,
) {
  // 1. Join to create member account and get authentication token
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create a new todo item with status 'active'
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: RandomGenerator.paragraph({ sentences: 5 }),
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);
  TestValidator.equals("todo status should be active", todo.status, "active");

  // 3. Update the todo item status to 'completed'
  const updatedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: todo.id,
      body: {
        status: "completed", // Toggle status from active to completed
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(updatedTodo);
  TestValidator.equals(
    "updated todo status should be completed",
    updatedTodo.status,
    "completed",
  );
  TestValidator.notEquals(
    "updated_at should change after status update",
    todo.updated_at,
    updatedTodo.updated_at,
  );
  TestValidator.equals(
    "created_at should remain unchanged",
    todo.created_at,
    updatedTodo.created_at,
  );
  TestValidator.equals(
    "title should remain unchanged",
    todo.title,
    updatedTodo.title,
  );
}
