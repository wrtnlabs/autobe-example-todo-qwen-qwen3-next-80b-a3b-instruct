import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_at_valid_id(connection: api.IConnection) {
  // Register new member
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash =
    "$2a$12$9L7F4kX7B8p1C3v0mY3h4O5l6A8b7X9n2R5q6WpL1S2t3N4y5Z6"; // realistic 60-character bcrypt hash
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Create a todo item
  const todoTitle = RandomGenerator.paragraph({ sentences: 3 });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: { title: todoTitle } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);

  // Retrieve the todo item by ID
  const retrievedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.at(connection, {
      todoId: createdTodo.id,
    });
  typia.assert(retrievedTodo);

  // Validate that retrieved todo matches created todo
  TestValidator.equals(
    "retrieved todo title matches",
    retrievedTodo.title,
    todoTitle,
  );
  TestValidator.equals(
    "retrieved todo member ID matches",
    retrievedTodo.todo_list_member_id,
    member.id,
  );
  TestValidator.equals(
    "retrieved todo status is active",
    retrievedTodo.status,
    "active",
  );
}
