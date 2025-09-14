import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_search_sort_by_updated_at(
  connection: api.IConnection,
) {
  // Step 1: Register a new member to establish authentication context
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash = "hashed_password_123"; // Static hash for testing
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create three todo items sequentially
  const item1: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({ sentences: 2 }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(item1);

  const item2: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({ sentences: 2 }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(item2);

  const item3: ITodoListTodo =
    await api.functional.todoList.member.todos.create(connection, {
      body: {
        title: RandomGenerator.paragraph({ sentences: 2 }),
      } satisfies ITodoListTodo.ICreate,
    });
  typia.assert(item3);

  // Step 3: Update item2 to set updated_at to a later timestamp
  await api.functional.todoList.member.todos.update(connection, {
    todoId: item2.id,
    body: {
      title: `${item2.title} (updated)`,
    } satisfies ITodoListTodo.IUpdate,
  });

  // Step 4: Update item1 to set updated_at to the latest timestamp
  await api.functional.todoList.member.todos.update(connection, {
    todoId: item1.id,
    body: {
      title: `${item1.title} (updated latest)`,
    } satisfies ITodoListTodo.IUpdate,
  });

  // Step 5: Search todos with sort='updated_at' and order='desc'
  const result: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        sort: "updated_at",
        order: "desc",
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(result);

  // Step 6: Validate the order of todo items
  // Expected order: item1 (most recent), item2 (second), item3 (least recent)
  TestValidator.equals("result has 3 items", result.data.length, 3);
  TestValidator.equals("first item is item1", result.data[0].id, item1.id);
  TestValidator.equals("second item is item2", result.data[1].id, item2.id);
  TestValidator.equals("third item is item3", result.data[2].id, item3.id);
}
