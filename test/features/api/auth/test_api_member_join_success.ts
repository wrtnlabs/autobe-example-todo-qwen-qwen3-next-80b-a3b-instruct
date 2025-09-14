import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_join_success(
  connection: api.IConnection,
) {
  // Generate valid test data using typia.random for type-safe values
  const email = typia.random<string & tags.Format<"email">>();
  // Generate a realistic bcrypt hash (standard format: $2a$12$ followed by 22 characters of base64)
  const passwordHash = `$2a$12$${typia.random<string>().substring(0, 22)}`;

  // Call the API endpoint with proper request body structure
  const response: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });

  // Validate the response structure and contents using typia.assert() which provides complete type validation
  typia.assert(response);
}
