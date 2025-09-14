import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_create_todo_title_too_long(
  connection: api.IConnection,
) {
  // Step 1: Create a member account for authentication
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const hashedPassword = "$2a$10$" + RandomGenerator.alphaNumeric(53); // Valid bcrypt hash format
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: hashedPassword,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a todo item with title exceeding 255 characters
  const longTitle = RandomGenerator.alphabets(256); // 256 characters
  await TestValidator.error(
    "todo creation should fail with title longer than 255 characters",
    async () => {
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: longTitle,
        } satisfies ITodoListTodo.ICreate,
      });
    },
  );
}
