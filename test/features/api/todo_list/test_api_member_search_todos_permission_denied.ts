import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_search_todos_permission_denied(
  connection: api.IConnection,
) {
  // Create a completely fresh connection object with no authentication headers
  // This represents a client that has never logged in
  const unauthConnection: api.IConnection = {
    ...connection,
    headers: {},
  };

  // Test that searching todos without any authentication fails with 401 Unauthorized
  await TestValidator.error(
    "unauthenticated request to search todos should return 401 unauthorized",
    async () => {
      await api.functional.todoList.member.todos.search(unauthConnection, {
        body: typia.random<ITodoListTodo.IRequest>(),
      });
    },
  );
}
