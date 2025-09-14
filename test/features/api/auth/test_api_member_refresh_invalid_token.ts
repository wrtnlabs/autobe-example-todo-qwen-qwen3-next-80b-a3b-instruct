import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_refresh_invalid_token(
  connection: api.IConnection,
) {
  // Step 1: Create a member account through join operation
  const joinBody: ITodoListMember.IJoin = {
    email: typia.random<string & tags.Format<"email">>(),
    password_hash: "hashed_password_123",
  };

  const authorized: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: joinBody,
    });
  typia.assert(authorized);

  // Step 2: Use a malformed refresh token format to ensure it fails validation
  // A valid refresh token is expected to be a JWT typically in the format xxxx.yyyy.zzzz, but we'll use
  // a UUID format that doesn't match any valid refresh token pattern
  const malformedRefreshToken =
    typia.random<string & tags.Format<"uuid">>() + ".malformed";

  // Step 3: Attempt refresh with invalid token - must fail with 401 Unauthorized
  await TestValidator.error(
    "refresh should fail with malformed token",
    async () => {
      await api.functional.auth.member.refresh(connection, {
        body: {
          refresh_token: malformedRefreshToken,
        } satisfies ITodoListMember.IRefresh,
      });
    },
  );
}
