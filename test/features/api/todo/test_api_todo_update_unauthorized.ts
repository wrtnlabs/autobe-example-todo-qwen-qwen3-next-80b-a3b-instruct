import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_unauthorized(
  connection: api.IConnection,
) {
  // Create first member account
  const firstMemberEmail = typia.random<string & tags.Format<"email">>();
  const firstMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: firstMemberEmail,
        password_hash: "hashed_password_1",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(firstMember);

  // Create todo item for first member
  const todoTitle = RandomGenerator.paragraph({ sentences: 3 });
  const createdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(createdTodo);

  // Create second member account
  const secondMemberEmail = typia.random<string & tags.Format<"email">>();
  const secondMember: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: secondMemberEmail,
        password_hash: "hashed_password_2",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(secondMember);

  // Attempt to update first member's todo with second member's context
  // This should fail with 403 Forbidden due to data ownership enforcement
  await TestValidator.error(
    "unauthorized user should not update another user's todo",
    async () => {
      await api.functional.todoList.member.todos.update(connection, {
        todoId: createdTodo.id,
        body: {
          title: "updated title",
        } satisfies ITodoListTodo.IUpdate,
      });
    },
  );
}
