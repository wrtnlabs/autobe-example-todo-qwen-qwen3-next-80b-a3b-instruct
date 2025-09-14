import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_create_todo_title_empty(
  connection: api.IConnection,
): Promise<void> {
  // Create member account for authentication context
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

  // Test with empty string title
  await TestValidator.error("empty title should fail", async () => {
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: "", // Empty string
      } satisfies ITodoListTodo.ICreate,
    });
  });

  // Test with whitespace-only title
  await TestValidator.error("whitespace-only title should fail", async () => {
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: "   \t\n  ", // Only whitespace
      } satisfies ITodoListTodo.ICreate,
    });
  });

  // Verify that a valid title works
  const validTitle = RandomGenerator.paragraph({
    sentences: 1,
    wordMin: 3,
    wordMax: 10,
  });
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: validTitle,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);
  TestValidator.equals("created todo title matches", todo.title, validTitle);
}
