import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_login_success(
  connection: api.IConnection,
): Promise<void> {
  // 1. Create a valid member account using join endpoint
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = typia.random<string>();

  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // 2. Authenticate the member using login endpoint with the same credentials
  const loginResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.login(connection, {
      body: {
        email: memberEmail,
        password_hash: passwordHash,
      } satisfies ITodoListMember.ILogin,
    });
  typia.assert(loginResponse);

  // 3. Validate the login response structure
  TestValidator.equals(
    "member ID matches between join and login",
    joinResponse.id,
    loginResponse.id,
  );
}
