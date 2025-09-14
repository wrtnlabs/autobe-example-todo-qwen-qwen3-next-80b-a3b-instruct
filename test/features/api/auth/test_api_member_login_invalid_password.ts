import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_login_invalid_password(
  connection: api.IConnection,
) {
  // Step 1: Create a valid member account with known credentials
  const validEmail: string = typia.random<string & tags.Format<"email">>();
  const validPasswordHash: string = typia.random<string>(); // Generate a valid hash string

  const createdMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: validEmail,
        password_hash: validPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(createdMember);

  // Step 2: Attempt to login with the valid email but invalid password_hash
  // This should fail with a 401 Unauthorized response
  await TestValidator.error(
    "login with invalid password_hash should fail",
    async () => {
      await api.functional.auth.member.login(connection, {
        body: {
          email: validEmail, // Valid existing email
          password_hash: "invalid_password_hash", // Explicitly invalid password hash
        } satisfies ITodoListMember.ILogin,
      });
    },
  );
}
