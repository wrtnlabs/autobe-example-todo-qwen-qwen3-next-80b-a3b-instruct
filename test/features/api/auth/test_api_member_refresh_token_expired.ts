import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_refresh_token_expired(
  connection: api.IConnection,
) {
  // Step 1: Join a new member to establish an account
  const email: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string =
    "bcrypt_hash_1234567890_abcdefghijklmnopqrstuvwxyz";
  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // Step 2: Login to obtain a real refresh token
  const loginResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.login(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.ILogin,
    });
  typia.assert(loginResponse);
  const validRefreshToken = loginResponse.token.refresh;

  // Step 3: Use an obviously invalid refresh token for refresh
  // We try to refresh with a token that we know does not exist (or is malformed)
  // This simulates a scenario where a token has been revoked, expired, or otherwise invalidated
  await TestValidator.error(
    "refresh should fail with 401 when refresh token is invalid",
    async () => {
      await api.functional.auth.member.refresh(connection, {
        body: {
          refresh_token: "invalid_refresh_token_12345", // clearly invalid
        } satisfies ITodoListMember.IRefresh,
      });
    },
  );

  // Step 4: Validate that the valid token still works (to ensure our test is not corrupted)
  // This ensures we're testing an invalid token's rejection, not an overall system failure
  const refreshWithValidToken: ITodoListMember.IAuthorized =
    await api.functional.auth.member.refresh(connection, {
      body: {
        refresh_token: validRefreshToken,
      } satisfies ITodoListMember.IRefresh,
    });
  typia.assert(refreshWithValidToken);
  TestValidator.notEquals(
    "new access token should differ from old access token",
    refreshWithValidToken.token.access,
    loginResponse.token.access,
  );
}
