import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_empty_title(
  connection: api.IConnection,
) {
  // Step 1: Authenticate a member to establish a valid session
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = "hashed_password_123";

  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Attempt to create a todo item with an empty title
  await TestValidator.error(
    "create todo with empty title should fail",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: "", // Empty string
        } satisfies ITodoListTodo.ICreate,
      });
    },
  );

  // Step 3: Attempt to create a todo item with a whitespace-only title
  await TestValidator.error(
    "create todo with whitespace-only title should fail",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: "   ", // Whitespace-only string
        } satisfies ITodoListTodo.ICreate,
      });
    },
  );
}
