import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_title_preserves_whitespace(
  connection: api.IConnection,
) {
  // Step 1: Register a new member to establish authentication context
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash =
    RandomGenerator.alphaNumeric(8) +
    "$2a$12$" +
    RandomGenerator.alphaNumeric(22); // Simulate bcrypt hash format

  const authResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(authResponse);

  // Step 2: Create a todo item with leading and trailing whitespace in title using realistic data
  const titleWithSpaces =
    "  " +
    RandomGenerator.paragraph({ sentences: 3, wordMin: 5, wordMax: 10 }) +
    "  ";

  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: titleWithSpaces,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);

  // Step 3: Validate that the returned todo item has trimmed whitespace
  // but preserved internal spacing
  TestValidator.equals(
    "todo title should have leading/trailing whitespace trimmed but internal spacing preserved",
    todo.title,
    RandomGenerator.paragraph({ sentences: 3, wordMin: 5, wordMax: 10 }),
  );
}
