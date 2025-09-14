import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_title_exceeding_limit(
  connection: api.IConnection,
) {
  // Step 1: Create a new member account to establish authentication context
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a todo item with a title exceeding 255 characters (256 characters)
  const longTitle: string = RandomGenerator.alphaNumeric(256);

  // Step 3: Expect the API to reject the request with an HTTP error (400 Bad Request)
  await TestValidator.error(
    "todo creation should fail with 400 when title exceeds 255 characters",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: longTitle,
        } satisfies ITodoListTodo.ICreate,
      });
    },
  );
}
