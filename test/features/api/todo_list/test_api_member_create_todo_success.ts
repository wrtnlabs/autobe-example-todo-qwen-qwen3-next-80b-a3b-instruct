import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_create_todo_success(
  connection: api.IConnection,
) {
  // Create a member account to establish authentication context
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash = "hashed_password_123";
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Create a new todo item for the authenticated member with a title that has leading and trailing whitespace
  const todoTitle = "  Test todo item with leading and trailing spaces  ";
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);

  // Validate the returned todo item's business logic
  TestValidator.equals(
    "todo title should be trimmed of leading and trailing whitespace",
    todo.title,
    "Test todo item with leading and trailing spaces",
  );
  TestValidator.equals(
    "todo status should be set to 'active' by default",
    todo.status,
    "active",
  );
  TestValidator.equals(
    "todo member id should match the authenticated member's id",
    todo.todo_list_member_id,
    member.id,
  );
  TestValidator.equals(
    "created_at and updated_at should be equal",
    todo.created_at,
    todo.updated_at,
  );
}
