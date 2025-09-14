import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_status_to_active(
  connection: api.IConnection,
) {
  // Step 1: Create new member account to establish authentication context
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash = RandomGenerator.alphaNumeric(64);
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a todo item with 'active' status (default)
  const todoTitle = RandomGenerator.paragraph({ sentences: 3 });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);
  TestValidator.equals(
    "todo status should be 'active' initially",
    createdTodo.status,
    "active",
  );

  // Step 3: Update todo item status to 'completed'
  const completedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: createdTodo.id,
      body: {
        status: "completed",
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(completedTodo);
  TestValidator.equals(
    "todo status should be 'completed' after update",
    completedTodo.status,
    "completed",
  );
  TestValidator.equals(
    "todo title should remain unchanged",
    completedTodo.title,
    todoTitle,
  );
  const initialUpdatedAt = completedTodo.updated_at;

  // Step 4: Update todo item status back to 'active'
  const updatedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: completedTodo.id,
      body: {
        status: "active",
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(updatedTodo);

  // Validation: Check the final state after toggling back to active
  TestValidator.equals(
    "todo status should be 'active' after update",
    updatedTodo.status,
    "active",
  );
  TestValidator.equals(
    "todo title should remain unchanged",
    updatedTodo.title,
    todoTitle,
  );
  TestValidator.equals(
    "created_at should be unchanged",
    updatedTodo.created_at,
    createdTodo.created_at,
  );
  TestValidator.notEquals(
    "updated_at should be updated when status toggled back to active",
    updatedTodo.updated_at,
    initialUpdatedAt,
  );
}
