import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import type { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_search_todos_success(
  connection: api.IConnection,
) {
  // 1. Create a member account for authentication
  const memberEmail: string = typia.random<string & tags.Format<"email">>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email: memberEmail,
        password_hash: "bcrypt_hashed_password_1234567890",
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // 2. Create multiple todo items for the authenticated member using ArrayUtil.repeat for maintainability
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const todos: ITodoListTodo[] = await ArrayUtil.asyncRepeat(
    5,
    async (index) => {
      const body: ITodoListTodo.ICreate = {
        title: RandomGenerator.paragraph({
          sentences: 3,
          wordMin: 3,
          wordMax: 8,
        }),
      };
      const todo: ITodoListTodo =
        await api.functional.todoList.member.todos.create(connection, {
          body: body satisfies ITodoListTodo.ICreate,
        });
      typia.assert(todo);
      return todo;
    },
  );

  // Ensure 5 todos were created
  TestValidator.equals("correct number of todos created", todos.length, 5);

  // 3. Search for all todos without filters (should return all 5)
  const allTodosResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {},
    });
  typia.assert(allTodosResponse);
  TestValidator.equals(
    "total data count matches created todos",
    allTodosResponse.data.length,
    todos.length,
  );
  TestValidator.equals(
    "pagination records count matches data count",
    allTodosResponse.pagination.records,
    todos.length,
  );

  // 4. Search with status filter 'active'
  const activeTodosResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        status: "active",
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(activeTodosResponse);
  const activeTodos = todos.filter((todo) => todo.status === "active");
  TestValidator.equals(
    "active todos count",
    activeTodosResponse.data.length,
    activeTodos.length,
  );

  // 5. Search with status filter 'completed'
  const completedTodosResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        status: "completed",
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(completedTodosResponse);
  const completedTodos = todos.filter((todo) => todo.status === "completed");
  TestValidator.equals(
    "completed todos count",
    completedTodosResponse.data.length,
    completedTodos.length,
  );

  // 6. Search with title search term 'meeting' (ensure one todo contains this term)
  const meetingTodo = todos[3]; // Assume the 4th todo contains 'meeting' in title
  const searchTodosResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        search: "meeting",
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(searchTodosResponse);
  const matchingTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes("meeting"),
  );
  TestValidator.equals(
    "search results count with 'meeting'",
    searchTodosResponse.data.length,
    matchingTodos.length,
  );
  TestValidator.predicate(
    "all matching todos contain the search term",
    searchTodosResponse.data.every((todo) =>
      todo.title.toLowerCase().includes("meeting"),
    ),
  );

  // 7. Search with date range 'created_after' (yesterday)
  const createdAfterResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        created_after: yesterday.toISOString(),
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(createdAfterResponse);
  const afterTodos = todos.filter(
    (todo) => new Date(todo.created_at) > yesterday,
  );
  TestValidator.equals(
    "created after count",
    createdAfterResponse.data.length,
    afterTodos.length,
  );

  // 8. Search with date range 'created_before' (today)
  const createdBeforeResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        created_before: today.toISOString(),
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(createdBeforeResponse);
  const beforeTodos = todos.filter((todo) => new Date(todo.created_at) < today);
  TestValidator.equals(
    "created before count",
    createdBeforeResponse.data.length,
    beforeTodos.length,
  );

  // 9. Search with pagination (page=1, limit=2)
  const paginatedResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        page: 1,
        limit: 2,
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(paginatedResponse);
  TestValidator.equals(
    "paginated limit",
    paginatedResponse.pagination.limit,
    2,
  );
  TestValidator.equals(
    "paginated page",
    paginatedResponse.pagination.current,
    1,
  );
  TestValidator.equals(
    "paginated data count",
    paginatedResponse.data.length,
    2,
  );

  // 10. Search with sort by updated_at (desc)
  const sortByUpdatedResponse: IPageITodoListTodo =
    await api.functional.todoList.member.todos.search(connection, {
      body: {
        sort: "updated_at",
        order: "desc",
      } satisfies ITodoListTodo.IRequest,
    });
  typia.assert(sortByUpdatedResponse);
  TestValidator.equals(
    "sort by updated_at count",
    sortByUpdatedResponse.data.length,
    todos.length,
  );

  // Validate that all returned todos belong to the authenticated member
  TestValidator.predicate(
    "all todos belong to authenticated member",
    sortByUpdatedResponse.data.every(
      (todo) => todo.todo_list_member_id === member.id,
    ),
  );
}
