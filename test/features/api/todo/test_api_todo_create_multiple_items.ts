import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_create_multiple_items(
  connection: api.IConnection,
) {
  // An authenticated member creates multiple todo items sequentially. First, the member registers via /auth/member/join to establish authentication context. The member then creates three distinct todo items with different titles via POST /todoList/member/todos. Each creation returns a unique todoId. This validates that the system can handle multiple item creations while maintaining data ownership and generating unique UUIDs for each item.

  // Step 1: Register a new member to establish authentication context
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = typia.random<string>();

  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create first todo item
  const firstTodoTitle: string = RandomGenerator.paragraph({ sentences: 3 });
  const firstTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: firstTodoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(firstTodo);
  TestValidator.equals(
    "first todo title matches",
    firstTodo.title,
    firstTodoTitle,
  );

  // Step 3: Create second todo item with different title
  const secondTodoTitle: string = RandomGenerator.paragraph({ sentences: 4 });
  const secondTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: secondTodoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(secondTodo);
  TestValidator.equals(
    "second todo title matches",
    secondTodo.title,
    secondTodoTitle,
  );
  TestValidator.notEquals(
    "first and second todo IDs differ",
    firstTodo.id,
    secondTodo.id,
  );

  // Step 4: Create third todo item with different title
  const thirdTodoTitle: string = RandomGenerator.paragraph({ sentences: 2 });
  const thirdTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: thirdTodoTitle,
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(thirdTodo);
  TestValidator.equals(
    "third todo title matches",
    thirdTodo.title,
    thirdTodoTitle,
  );
  TestValidator.notEquals(
    "second and third todo IDs differ",
    secondTodo.id,
    thirdTodo.id,
  );
  TestValidator.notEquals(
    "first and third todo IDs differ",
    firstTodo.id,
    thirdTodo.id,
  );

  // Step 5: Verify all todos belong to the same member
  TestValidator.equals(
    "first todo belongs to member",
    firstTodo.todo_list_member_id,
    member.id,
  );
  TestValidator.equals(
    "second todo belongs to member",
    secondTodo.todo_list_member_id,
    member.id,
  );
  TestValidator.equals(
    "third todo belongs to member",
    thirdTodo.todo_list_member_id,
    member.id,
  );

  // Step 6: Verify all todos have active status
  TestValidator.equals(
    "first todo status is active",
    firstTodo.status,
    "active",
  );
  TestValidator.equals(
    "second todo status is active",
    secondTodo.status,
    "active",
  );
  TestValidator.equals(
    "third todo status is active",
    thirdTodo.status,
    "active",
  );

  // Step 7: Verify created_at and updated_at are properly formatted timestamps per DTO specification
  // This is guaranteed by typia.assert() after API calls
  // No additional validation needed - typia.assert() already validates all format constraints
}
