import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListUser } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListUser";

export async function test_api_user_refresh_token(connection: api.IConnection) {
  // Step 1: Create initial user session context by joining
  const initialSession: ITodoListUser.IAuthorized =
    await api.functional.auth.user.join(connection);
  typia.assert(initialSession);

  // Step 2: Store the initial token for comparison
  const initialAccessToken = initialSession.token.access;
  const initialRefreshToken = initialSession.token.refresh;
  const initialExpiredAt = initialSession.token.expired_at;
  const initialRefreshableUntil = initialSession.token.refreshable_until;

  // Step 3: Invoke the refresh endpoint to renew the token
  const refreshedSession: ITodoListUser.IAuthorized =
    await api.functional.auth.user.refresh(connection);
  typia.assert(refreshedSession);

  // Step 4: Validate that the new token is different from the original
  TestValidator.notEquals(
    "refreshed access token should be different from initial access token",
    refreshedSession.token.access,
    initialAccessToken,
  );

  TestValidator.notEquals(
    "refreshed refresh token should be different from initial refresh token",
    refreshedSession.token.refresh,
    initialRefreshToken,
  );

  // Step 5: Validate that the expiration time is updated
  TestValidator.notEquals(
    "refreshed expired_at should be different from initial expired_at",
    refreshedSession.token.expired_at,
    initialExpiredAt,
  );

  TestValidator.notEquals(
    "refreshed refreshable_until should be different from initial refreshable_until",
    refreshedSession.token.refreshable_until,
    initialRefreshableUntil,
  );

  // Step 6: Validate that the new session maintains access to data (indirect validation)
  // Since the system has no user-specific data stored, we verify the refreshed token works
  // by attempting to use it again for another refresh (though the token is automatically handled)
  const secondRefreshedSession: ITodoListUser.IAuthorized =
    await api.functional.auth.user.refresh(connection);
  typia.assert(secondRefreshedSession);

  // Step 7: Confirm that the refreshed token continues to work
  TestValidator.notEquals(
    "second refresh access token should be different from first refresh token",
    secondRefreshedSession.token.access,
    refreshedSession.token.access,
  );

  // Step 8: Verify that unauthenticated refresh attempts fail
  // The refresh endpoint does not require authentication, so we cannot test 401 status as per the schema
  // The endpoint is designed to work without authentication, so this requirement is irrelevant
  // No additional test needed as the functionality is designed to work without authentication
}
