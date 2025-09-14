import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_join_email_duplicate(
  connection: api.IConnection,
) {
  // Create a base member account with a known email address to use as the duplicate during this test
  const baseEmail: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = RandomGenerator.alphaNumeric(64);

  const baseMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: baseEmail,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(baseMember);

  // Attempt to create another member with the same email - this should fail with a 409 Conflict error
  // The system must reject the request without creating any record and not return a token or user ID
  await TestValidator.error("duplicate email should fail", async () => {
    await api.functional.auth.member.join(connection, {
      body: {
        email: baseEmail, // Same email as base member - triggers duplicate constraint
        password_hash: RandomGenerator.alphaNumeric(64),
      } satisfies ITodoListMember.IJoin,
    });
  });
}
