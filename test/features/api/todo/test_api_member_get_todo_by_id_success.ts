import { ArrayUtil, RandomGenerator, TestValidator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import typia, { tags } from "typia";

import api from "@ORGANIZATION/PROJECT-api";
import type { IAuthorizationToken } from "@ORGANIZATION/PROJECT-api/lib/structures/IAuthorizationToken";
import type { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import type { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";

export async function test_api_member_get_todo_by_id_success(
  connection: api.IConnection,
) {
  // Create a member account to establish authentication context
  const email: string = typia.random<string & tags.Format<"email">>();
  const password_hash: string = typia.random<string>();
  const member: ITodoListMember.IAuthorized =
    await api.functional.auth.member.join(connection, {
      body: {
        email,
        password_hash,
      } satisfies ITodoListMember.IJoin,
    });
  typia.assert(member);

  // Create a specific todo item for the authenticated member
  const title: string = RandomGenerator.name(); // Ensures 1-255 char constraint
  const todo: ITodoListTodo = await api.functional.todoList.member.todos.create(
    connection,
    {
      body: {
        title,
      } satisfies ITodoListTodo.ICreate,
    },
  );
  typia.assert(todo);
  TestValidator.equals("todo title matches", todo.title, title);
  TestValidator.equals("todo status is active", todo.status, "active");
  TestValidator.equals(
    "todo owner matches member",
    todo.todo_list_member_id,
    member.id,
  );

  // Retrieve the todo item by its unique ID
  const retrievedTodo: ITodoListTodo =
    await api.functional.todoList.member.todos.at(connection, {
      todoId: todo.id,
    });
  typia.assert(retrievedTodo);

  // Validate the retrieved todo item matches the created one
  TestValidator.equals("retrieved todo id matches", retrievedTodo.id, todo.id);
  TestValidator.equals(
    "retrieved todo title matches",
    retrievedTodo.title,
    todo.title,
  );
  TestValidator.equals(
    "retrieved todo status matches",
    retrievedTodo.status,
    todo.status,
  );
  TestValidator.equals(
    "retrieved todo owner matches member",
    retrievedTodo.todo_list_member_id,
    member.id,
  );
}
