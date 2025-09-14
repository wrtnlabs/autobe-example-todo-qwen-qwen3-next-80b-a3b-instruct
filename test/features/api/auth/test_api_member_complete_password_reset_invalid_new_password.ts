import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_complete_password_reset_invalid_new_password(
  connection: api.IConnection,
) {
  // 1. Create a member account to set up a valid account for the reset flow
  const email = typia.random<string & tags.Format<"email">>();
  // Use a realistic bcrypt hash (60 characters long, matches $2a$ or $2b$ prefix format)
  const initialPasswordHash =
    "$2a$12$" + typia.random<string & tags.Pattern<"[A-Za-z0-9./]{53}">>();
  const member = await api.functional.auth.member.join(connection, {
    body: {
      email,
      password_hash: initialPasswordHash,
    } satisfies ITodoListMember.IJoin,
  });
  typia.assert(member);

  // 2. Initiate a password reset to generate a valid reset token
  const resetInitiation =
    await api.functional.auth.member.password.reset.request.requestPasswordReset(
      connection,
      {
        body: {
          email,
        } satisfies ITodoListMember.IRequestPasswordReset,
      },
    );
  typia.assert(resetInitiation);

  // 3. Generate a realistic reset token (string of any format)
  const resetToken = typia.random<string>();

  // 4. Attempt to complete the password reset with a new password hash that is too short (7 characters)
  // The system should reject this with a 400 Bad Request error (business rule violation)
  await TestValidator.error(
    "password reset should fail with new password hash less than 8 characters",
    async () => {
      await api.functional.auth.member.password.reset.complete.completePasswordReset(
        connection,
        {
          body: {
            reset_token: resetToken,
            new_password_hash: "short7", // 7 characters - below minimum requirement
          } satisfies ITodoListMember.ICompletePasswordReset,
        },
      );
    },
  );
}
