import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_unauthenticated(
  connection: api.IConnection,
) {
  // Test that unauthenticated request to create todo returns 401 Unauthorized
  // Create an unauthenticated connection by cloning with empty headers to ensure no auth token is present
  const unauthConn: api.IConnection = { ...connection, headers: {} };

  await TestValidator.error(
    "unauthenticated user cannot create todo item",
    async () => {
      await api.functional.todoList.member.todos.create(unauthConn, {
        body: {
          title: RandomGenerator.paragraph({ sentences: 1 }),
        } satisfies ITodoListTodo.ICreate,
      });
    },
  );
}
