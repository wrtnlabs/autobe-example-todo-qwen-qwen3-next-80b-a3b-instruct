import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_login_email_not_found(
  connection: api.IConnection,
) {
  // Generate a valid email address for joining
  const joinEmail = typia.random<string & tags.Format<"email">>();

  // Use a valid bcrypt hash pattern (60+ characters, format: $2a$10$...)
  // This is a real bcrypt hash for "password123" with cost factor 10
  const joinPasswordHash =
    "$2a$10$9Gc8YJs9U/hcpShIYmc5juIN6tndLS6Uzoo9uU7/YZn3Yn5Crlerm";

  // Join/create a member account
  const joinResponse = await api.functional.auth.member.join(connection, {
    body: {
      email: joinEmail,
      password_hash: joinPasswordHash,
    } satisfies ITodoListMember.IJoin,
  });
  typia.assert(joinResponse);

  // Ensure the joined account has the expected structure
  TestValidator.equals(
    "joined user has valid ID",
    typeof joinResponse.id,
    "string",
  );
  TestValidator.equals(
    "joined user has valid token structure",
    joinResponse.token.access.length > 0,
    true,
  );

  // Generate a different, valid email address for the login attempt (no risk of being the same)
  let loginEmail = typia.random<string & tags.Format<"email">>();
  // Guarantee it's different from the join.Email
  while (loginEmail === joinEmail) {
    loginEmail = typia.random<string & tags.Format<"email">>();
  }

  // Use a valid bcrypt hash for login password
  const loginPasswordHash =
    "$2a$10$9Gc8YJs9U/hcpShIYmc5juIN6tndLS6Uzoo9uU7/YZn3Yn5Crlerm";

  // Attempt to login with non-existent email - should fail with 401 Unauthorized
  await TestValidator.error(
    "login should fail when email does not exist",
    async () => {
      await api.functional.auth.member.login(connection, {
        body: {
          email: loginEmail,
          password_hash: loginPasswordHash,
        } satisfies ITodoListMember.ILogin,
      });
    },
  );
}
