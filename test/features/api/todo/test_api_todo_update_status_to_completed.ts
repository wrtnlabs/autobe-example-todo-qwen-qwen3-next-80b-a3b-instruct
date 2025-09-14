import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_status_to_completed(
  connection: api.IConnection,
) {
  // Step 1: Register new member to establish authentication context
  const email: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: email,
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a todo item with 'active' status to get a valid todoId
  const todoTitle: string = RandomGenerator.paragraph({
    sentences: 5,
    wordMin: 4,
    wordMax: 7,
  });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);
  TestValidator.equals("todo status is active", createdTodo.status, "active");

  // Step 3: Update the todo item status to 'completed'
  const updatedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: createdTodo.id,
      body: {
        status: "completed",
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(updatedTodo);

  // Step 4: Validate the update was successful - status is 'completed' and title unchanged
  TestValidator.equals(
    "todo status is completed",
    updatedTodo.status,
    "completed",
  );
  TestValidator.equals("todo title unchanged", updatedTodo.title, todoTitle);
  TestValidator.predicate(
    "updated_at is set",
    updatedTodo.updated_at !== createdTodo.created_at,
  );
}
