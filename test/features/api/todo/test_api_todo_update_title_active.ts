import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_todo_update_title_active(
  connection: api.IConnection,
) {
  // Step 1: Register a new member to establish authentication context
  const email = typia.random<string & tags.Format<"email">>();
  const passwordHash = RandomGenerator.alphaNumeric(64);
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash: passwordHash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Step 2: Create a new todo item with active status
  const todoTitle = RandomGenerator.paragraph({ sentences: 3 });
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title: todoTitle,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);
  TestValidator.equals("todo status is active", todo.status, "active");
  TestValidator.equals("todo title matches", todo.title, todoTitle);

  // Step 3: Update the todo item's title
  const newTitle = RandomGenerator.paragraph({ sentences: 4 });
  const updatedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.update(connection, {
      todoId: todo.id,
      body: {
        title: newTitle,
      } satisfies ITodoListTodo.IUpdate,
    });
  typia.assert(updatedTodo);

  // Step 4: Validate the update
  TestValidator.equals("todo title updated", updatedTodo.title, newTitle);
  TestValidator.equals("todo id unchanged", updatedTodo.id, todo.id);
  TestValidator.equals("todo status unchanged", updatedTodo.status, "active");
  TestValidator.predicate("updated_at is after created_at", () => {
    return new Date(updatedTodo.updated_at) > new Date(todo.created_at);
  });
  TestValidator.predicate("created_at unchanged", () => {
    return updatedTodo.created_at === todo.created_at;
  });
}
