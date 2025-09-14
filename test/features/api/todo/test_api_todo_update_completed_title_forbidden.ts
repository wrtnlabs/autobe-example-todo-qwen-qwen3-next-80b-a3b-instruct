import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_completed_title_forbidden(
  connection: api.IConnection,
) {
  // 1. Register a new member account
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash = "bcrypt_hashed_1234567890123456789012"; // Valid bcrypt hash format for testing
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create a new todo item with active status
  const title = RandomGenerator.paragraph({
    sentences: 3,
    wordMin: 2,
    wordMax: 8,
  }); // Ensures under 255 chars
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);
  TestValidator.equals("todo title matches", todo.title, title);

  // 3. Update the todo item status to 'completed'
  const updatedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: todo.id,
      body: {
        status: "completed",
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(updatedTodo);
  TestValidator.equals(
    "todo status is completed",
    updatedTodo.status,
    "completed",
  );

  // 4. Attempt to update the title of the completed todo item (should fail with 403 Forbidden)
  const newTitle = "Updated completed task";
  await TestValidator.httpError(
    "title update on completed todo should be forbidden",
    403,
    async () => {
      await api.functional.todoList.member.todos.update(connection, {
        todoId: todo.id,
        body: {
          title: newTitle,
        } satisfies ITodoListTodo.IUpdate,
      });
    },
  );
}
