import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";

export async function test_api_member_update_password_success(
  connection: api.IConnection,
) {
  // Step 1: Create a member account with a known initial password_hash
  const initialEmail: string = typia.random<string & tags.Format<"email">>();
  const initialPasswordHash: string = "hashed_initial_password_12345678"; // Must be at least 8 chars and bcrypt-hashed
  const joinResponse: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: initialEmail,
        password_hash: initialPasswordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(joinResponse);

  // Step 2: Establish authenticated connection with the new member
  // The SDK automatically handles the token in connection.headers after join

  // Step 3: Update the member's password with current password_hash and new password_hash
  const newPasswordHash: string = "hashed_new_password_abcdefgh"; // Must be at least 8 chars and bcrypt-hashed
  const updateResponse: ITodoListMember =
    await api.functional.auth.member.password.update.updatePassword(
      connection,
      {
        body: {
          current_password_hash: initialPasswordHash,
          new_password_hash: newPasswordHash,
        } satisfies ITodoListMember.IUpdatePassword,
      },
    );
  typia.assert(updateResponse);

  // Step 4: Validate the updated member data
  TestValidator.equals(
    "updated email matches",
    updateResponse.email,
    initialEmail,
  );
  TestValidator.notEquals(
    "password_hash was updated",
    updateResponse.password_hash,
    initialPasswordHash,
  );
  TestValidator.equals(
    "new password_hash matches",
    updateResponse.password_hash,
    newPasswordHash,
  );
  TestValidator.equals(
    "member id unchanged",
    updateResponse.id,
    joinResponse.id,
  );
}
