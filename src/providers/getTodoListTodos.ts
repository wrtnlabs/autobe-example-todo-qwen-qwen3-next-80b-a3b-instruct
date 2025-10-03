import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import typia, { tags } from "typia";
import { v4 } from "uuid";
import { MyGlobal } from "../MyGlobal";
import { PasswordUtil } from "../utils/passwordUtil";
import { toISOStringSafe } from "../utils/toISOStringSafe";

import { IPageITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodoListTask";
import { IPage } from "@ORGANIZATION/PROJECT-api/lib/structures/IPage";
import { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";

export async function getTodoListTodos(): Promise<IPageITodoListTodoListTask> {
  // Retrieve all tasks from the todo_list_task table
  const tasks = await MyGlobal.prisma.todo_list_task.findMany({
    orderBy: { id: "asc" },
  });

  // Calculate pagination metadata
  const totalTasks = tasks.length;
  const limit = 20;
  const pages = Math.ceil(totalTasks / limit);

  // Return complete response structure matching IPageITodoListTodoListTask
  return {
    pagination: {
      current: 0,
      limit,
      records: totalTasks,
      pages,
    },
    data: tasks.map((task) => ({
      id: task.id as string & tags.Format<"uuid">,
      title: task.title,
      is_completed: task.is_completed,
    })),
  };
}
