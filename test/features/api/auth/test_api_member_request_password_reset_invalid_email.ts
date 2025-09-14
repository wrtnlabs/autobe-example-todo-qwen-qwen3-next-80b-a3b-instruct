import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_request_password_reset_invalid_email(
  connection: api.IConnection,
) {
  // Step 1: Join a new member to ensure we have a valid member account in the system
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: "hashed_password_123",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Use a non-existent email address for the password reset request
  const invalidEmail: string = "nonexistent@example.com";

  // Step 3: Request password reset for non-existent email
  const response: ITodoListMember.IResetInitiated =
    await api.functional.auth.member.password.reset.request.requestPasswordReset(
      connection,
      {
        body: {
          email: invalidEmail,
        } satisfies ITodoListMember.IRequestPasswordReset,
      },
    );
  typia.assert(response);

  // Step 4: Validate that the response matches the invalid email and confirms successful initiation
  TestValidator.equals(
    "password reset response email matches requested invalid email",
    response.email,
    invalidEmail,
  );
}
