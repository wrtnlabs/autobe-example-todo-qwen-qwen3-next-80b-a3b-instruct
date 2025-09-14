import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_search_pagination(
  connection: api.IConnection,
) {
  // 1. Create a new member account to establish authentication context
  const email: string = typia.random<string & tags.Format<"email">>();
  const passwordHash: string = typia.random<string>();

  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create 25 todo items sequentially
  const todoItems: ITodoListTodo[] = [];

  for (let i = 0; i < 25; i++) {
    const todo: ITodoListTodo =
      await api.functional.todoList.member.todos.create(connection, {
        body: {
          title: RandomGenerator.paragraph({
            sentences: 3,
            wordMin: 5,
            wordMax: 10,
          }),
        } satisfies ITodoListTodo.ICreate,
      });
    typia.assert(todo);
    todoItems.push(todo);
  }

  // 3. Search with pagination parameters page=2 and limit=10
  const result: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        page: 2,
        limit: 10,
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(result);

  // 4. Validate pagination metadata
  TestValidator.equals(
    "pagination current page is 2",
    result.pagination.current,
    2,
  );
  TestValidator.equals("pagination limit is 10", result.pagination.limit, 10);
  TestValidator.equals(
    "pagination records is 25",
    result.pagination.records,
    25,
  );
  TestValidator.equals("pagination pages is 3", result.pagination.pages, 3);

  // 5. Validate that response contains exactly 10 items
  TestValidator.equals(
    "response contains exactly 10 items",
    result.data.length,
    10,
  );

  // 6. Validate that returned items are items 11-20 in the ordered list (newest first)
  // Since todo items are ordered by created_at descending (newest first),
  // and the total list has 25 items:
  // - Items 1-10 (page 1) are indexes 24-15 in todoItems (newest to 11th newest)
  // - Items 11-20 (page 2) are indexes 14-5 in todoItems (10th newest to 6th newest)
  // - Items 21-25 (page 3) are indexes 4-0 in todoItems (5th newest to oldest)

  // For page 2 (items 11-20), we need the 10 items from index 14 to 5 in todoItems
  for (let i = 0; i < 10; i++) {
    const indexInTodoItems = 14 - i; // Start from 14th newest (index 14) descending to 5th newest (index 5)
    TestValidator.equals(
      `item ${i + 11} matches`,
      result.data[i].id,
      todoItems[indexInTodoItems].id,
    );
  }
}
