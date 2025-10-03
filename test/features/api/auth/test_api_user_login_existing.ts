import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_user_login_existing(
  connection: api.IConnection,
) {
  // Step 1: Create new user context with join operation
  const joinResponse: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(joinResponse);

  // Store the original join token for comparison
  const originalToken = joinResponse.token.access;

  // Step 2: Call login endpoint to obtain new token
  const loginResponse: ITodoListUser.IAuthorized =
    await api.functional.auth.user.login(connection);
  typia.assert(loginResponse);

  // Step 3: Validate that login issued a new token different from join token
  TestValidator.notEquals(
    "login token must be different from join token",
    loginResponse.token.access,
    originalToken,
  );

  // Step 4: Validate that the session context is maintained (connection headers updated)
  TestValidator.equals(
    "connection header Authorization must be updated with new token",
    connection.headers?.Authorization,
    loginResponse.token.access,
  );
}
