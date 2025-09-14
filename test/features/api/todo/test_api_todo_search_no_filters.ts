import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_search_no_filters(
  connection: api.IConnection,
) {
  // Step 1: Create first member account
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: "hashed_password_123", // Valid format, no constraints in schema
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create first todo item
  const todo1: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 3,
          wordMin: 3,
          wordMax: 8,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo1);

  // Step 3: Create second todo item
  const todo2: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 4,
          wordMin: 4,
          wordMax: 10,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo2);

  // Step 4: Create third todo item with different status
  const todo3: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({
          sentences: 2,
          wordMin: 5,
          wordMax: 12,
        }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(todo3);

  // Step 5: Search for all todo items without filters (empty request body)
  const result: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {} satisfies ITodoListTodo.IRequest,
    });
  typia.assert(result);

  // Step 6: Validate that all three todo items are returned in descending created_at order
  TestValidator.equals(
    "pagination has correct count",
    result.pagination.records,
    3,
  );
  TestValidator.equals(
    "pagination has correct limit",
    result.pagination.limit,
    20,
  ); // Default limit
  TestValidator.equals(
    "pagination has correct page",
    result.pagination.current,
    1,
  ); // Default page
  TestValidator.equals(
    "pagination has correct pages",
    result.pagination.pages,
    1,
  ); // Only one page
  TestValidator.equals("data array has three items", result.data.length, 3);

  // Validate order of todos by created_at (descending)
  const todosOrderedByDate: ITodoListTodo[] = [todo1, todo2, todo3].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  for (let i = 0; i < result.data.length; i++) {
    TestValidator.equals(
      `todo ${i + 1} has correct created_at order`,
      result.data[i].created_at,
      todosOrderedByDate[i].created_at,
    );
  }

  // Validate strict data ownership: each todo belongs to the created member
  for (const todo of result.data) {
    TestValidator.equals(
      "todo belongs to correct member",
      todo.todo_list_member_id,
      member.id,
    );
    // Ensure no other member's data is present
    TestValidator.notEquals(
      "todo's member ID does not match any other member ID",
      todo.todo_list_member_id,
      "00000000-0000-0000-0000-000000000000", // Invalid UUID, not possible in system
    );
  }
}
