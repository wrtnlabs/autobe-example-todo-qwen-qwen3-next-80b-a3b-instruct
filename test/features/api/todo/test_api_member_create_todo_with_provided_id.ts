import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_create_todo_with_provided_id(
  connection: api.IConnection,
) {
  // Step 1: Create a member account to establish authentication context
  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // Step 2: Create a todo item with valid request body (only title provided)
  const todoTitle = RandomGenerator.paragraph({
    sentences: 5,
    wordMin: 3,
    wordMax: 10,
  });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);

  // Step 3: Validate that the server automatically assigned the authenticated member's ID
  TestValidator.equals(
    "todo item should be owned by the authenticated member",
    createdTodo.todo_list_member_id,
    joinResponse.id,
  );

  // Step 4: Validate that the server auto-generated a UUID for the todo item
  // The ID is not provided by client, so verify it exists and is a valid UUID
  TestValidator.predicate("todo item has a valid UUID format", () => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(createdTodo.id);
  });

  // Step 5: Validate that the status is automatically set to 'active' (default)
  TestValidator.equals(
    "new todo item status should be 'active' by default",
    createdTodo.status,
    "active",
  );

  // Step 6: Validate that created_at and updated_at were set appropriately
  // The typia.assert(createdTodo) already validates these are valid date-time strings
  // No additional validation needed
}
