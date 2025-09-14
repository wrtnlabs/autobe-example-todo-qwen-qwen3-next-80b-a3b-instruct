import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_get_todo_by_id_not_found(
  connection: api.IConnection,
) {
  // Create a new member account for authentication
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Generate a valid UUID format but non-existent todo ID
  const nonExistentTodoId: string = typia.random<
    string & tags.Format<"uuid">
  >();

  // Test retrieval of non-existent todo item (should return 404 Not Found)
  // Note: We use TestValidator.error to validate that the API throws HTTP error with 404 status
  await TestValidator.error(
    "retrieving non-existent todo should return 404 Not Found",
    async () => {
      await api.functional.todoList.member.todos.at(connection, {
        todoId: nonExistentTodoId,
      });
    },
  );
}
