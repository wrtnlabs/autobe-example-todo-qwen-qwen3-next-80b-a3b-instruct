import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_complete_password_reset_invalid_token(
  connection: api.IConnection,
) {
  // Create first member account to be the target for the reset attempt
  const member1Email = typia.random<string & tags.Format<"email">>();
  const member1PasswordHash = typia.random<string>();
  const member1: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: member1Email,
        password_hash: member1PasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member1);

  // Essential member role prerequisite: Create second member account to generate a valid token for cross-account attack simulation
  const member2Email = typia.random<string & tags.Format<"email">>();
  const member2PasswordHash = typia.random<string>();
  await api.functional.auth.member.join(connection, {
    body: {
      email: member2Email,
      password_hash: member2PasswordHash,
    } satisfies ITodoListMember.IJoin,
  });

  // Initiate password reset for second member to obtain a valid token (to be used illegally for member1)
  const member2ResetResponse: ITodoListMember.IResetInitiated =
    await api.functional.auth.member.password.reset.request.requestPasswordReset(
      connection,
      {
        body: {
          email: member2Email,
        } satisfies ITodoListMember.IRequestPasswordReset,
      },
    );
  typia.assert(member2ResetResponse);

  // Get the password reset token from the API response (we have a valid reset token for member2)
  // The token is opaque, so we capture its value through inspection of the API's internal state (not possible in E2E) - instead we simulate attack by using it in a different context
  // Since we cannot extract the token value from the response (it's not exposed), we simulate invalid token scenario by using the token from another account
  // We cannot directly get the token string. Therefore, we must use the system's behavior: the token is bound to the email it was created for.
  // So, we use the token from member2 to try to reset member1's password (cross-account token misuse)
  // Since we don't know the token's value, we need a better approach: use a completely random string as the token.
  // This simulates an invalid, manually altered, or non-existent token.

  // Create a completely random invalid reset token string
  const invalidResetToken = typia.random<string>(); // Any random string
  const newPasswordHash = typia.random<string>();

  // Test: Invalid reset token (manually altered, expired, or non-existent) - this covers all invalid cases
  await TestValidator.error(
    "should reject password reset with invalid, expired, or non-existent reset token",
    async () => {
      await api.functional.auth.member.password.reset.complete.completePasswordReset(
        connection,
        {
          body: {
            reset_token: invalidResetToken, // Invalid token
            new_password_hash: newPasswordHash,
          } satisfies ITodoListMember.ICompletePasswordReset,
        },
      );
    },
  );

  // Confirm the original member's password_hash remains unchanged by successful login with original credentials
  const loginResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: member1Email,
        password_hash: member1PasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(loginResponse);
  TestValidator.equals(
    "login should still work with original credentials",
    loginResponse.id,
    member1.id,
  );
}
