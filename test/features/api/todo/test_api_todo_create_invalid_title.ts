import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_invalid_title(
  connection: api.IConnection,
) {
  // Step 1: Authenticate as a new member to establish authentication context
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: typia.random<string & tags.Format<"email">>(),
        password_hash: RandomGenerator.alphaNumeric(64),
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Attempt to create a todo with empty title (should fail)
  await TestValidator.error(
    "todo creation with empty title should fail",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: { title: "" } satisfies ITodoListTodo.ICreate,
      });
    },
  );

  // Step 3: Attempt to create a todo with title exceeding 255 characters (should fail)
  const longTitle = RandomGenerator.paragraph({
    sentences: 100,
    wordMin: 20,
    wordMax: 25,
  });
  await TestValidator.error(
    "todo creation with title over 255 characters should fail",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: { title: longTitle } satisfies ITodoListTodo.ICreate,
      });
    },
  );
}
