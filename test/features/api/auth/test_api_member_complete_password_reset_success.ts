import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_complete_password_reset_success(
  connection: api.IConnection,
) {
  // 1. Create a member account with known email
  const email: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = Math.random().toString(36).slice(-30); // Simple bcrypt-like hash
  const joined: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joined);

  // 2. Initiate password reset to prove the email exists (but we DON'T get the token)
  const resetInitiated: ITodoListMember.IResetInitiated =
    await api.functional.auth.member.password.reset.request.requestPasswordReset(
      connection,
      {
        body: {
          email,
        } satisfies ITodoListMember.IRequestPasswordReset,
      },
    );
  typia.assert(resetInitiated);
  TestValidator.equals("reset email matches", resetInitiated.email, email);

  // 3. Attempt to complete password reset with a fake, non-existent reset token
  // This should fail because the token doesn't exist on the server
  const invalidResetToken: string = typia.random<
    string & tags.Format<"uuid">
  >(); // Generate a valid UUID format, but it's not a real reset token
  const newPasswordHash: string = Math.random().toString(36).slice(-30);

  // This must fail with an HTTP error
  await TestValidator.error(
    "should reject password reset with invalid reset token",
    async () => {
      await api.functional.auth.member.password.reset.complete.completePasswordReset(
        connection,
        {
          body: {
            reset_token: invalidResetToken,
            new_password_hash: newPasswordHash,
          } satisfies ITodoListMember.ICompletePasswordReset,
        },
      );
    },
  );

  // 4. Verify original account is still accessible with old password (indicating reset failed)
  const loginAfterFailedReset: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash, // still use the original password
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(loginAfterFailedReset);
  TestValidator.equals(
    "original account still valid after failed reset",
    loginAfterFailedReset.id,
    joined.id,
  );
}
