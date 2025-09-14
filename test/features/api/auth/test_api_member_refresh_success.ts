import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_refresh_success(
  connection: api.IConnection,
) {
  // Step 1: Join a new member to establish account
  const joinEmail = typia.random<string & tags.Format<"email">>();
  const joinPasswordHash = typia.random<string>();
  const joinedMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: joinEmail,
        password_hash: joinPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinedMember);

  // Step 2: Login to obtain refresh token
  const loginMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.login(connection, {
      body: {
        email: joinEmail,
        password_hash: joinPasswordHash,
      } satisfies ITodoListMember.ILogin,
    });
  typia.assert(loginMember);
  const originalRefreshToken = loginMember.token.refresh;

  // Step 3: Refresh the expired token (simulated by backend)
  const refreshedMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.refresh(connection, {
      body: {
        refresh_token: originalRefreshToken,
      } satisfies ITodoListMember.IRefresh,
    });
  typia.assert(refreshedMember);

  // Validate refresh response
  TestValidator.notEquals(
    "new access token differs from old",
    refreshedMember.token.access,
    loginMember.token.access,
  );
  TestValidator.notEquals(
    "new refresh token differs from old",
    refreshedMember.token.refresh,
    originalRefreshToken,
  );
  TestValidator.equals(
    "user id matches original login",
    refreshedMember.id,
    loginMember.id,
  );
}
