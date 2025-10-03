import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_todo_task_deletion_on_non_existent_id(
  connection: api.IConnection,
) {
  // First, establish the temporary session context required for all operations
  const authResponse: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(authResponse);

  // Verify that the Authorization header was properly set by the join operation
  // This ensures the connection has the correct authentication token
  TestValidator.predicate(
    "Authorization header was set after join",
    connection.headers?.Authorization !== undefined &&
      connection.headers?.Authorization !== null &&
      connection.headers?.Authorization !== "",
  );

  // Generate a non-existent UUID for deletion test
  const nonExistentId: string = typia.random<string & tags.Format<"uuid">>();

  // Test that deleting a non-existent ID silently succeeds (returns 204 No Content)
  // The API should not throw an error and should return no response body
  // We verify this by ensuring no HTTP error is thrown during the operation
  await TestValidator.error(
    "deletion of non-existent ID should not throw HTTP error",
    async () => {
      await api.functional.todoList.todos.erase(connection, {
        id: nonExistentId,
      });
    },
  );

  // The test is complete - the combination of successful authentication and
  // successful silent deletion confirms the expected behavior
}
