import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_success(
  connection: api.IConnection,
) {
  // 1. Authenticate as a new member by joining
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash:
          "$2b$12$MqTvqbmVW0mC5HZX8.IuNOUedUVXxH0qTvOQg.a.C.KTvhvPIs8JU4vSa", // A realistic bcrypt hash
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create a new todo item with valid title
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: "Complete API documentation", // Exactly 24 characters, satisfies MinLength<1> and MaxLength<255>
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);

  // 3. Validate business logic: todo owner ID matches member ID and status is active
  TestValidator.equals(
    "todo owner ID matches member ID",
    todo.todo_list_member_id,
    member.id,
  );
  TestValidator.equals("todo status is active", todo.status, "active");
  TestValidator.equals(
    "todo title matches",
    todo.title,
    "Complete API documentation",
  );
}
