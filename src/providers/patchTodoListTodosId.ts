import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import typia, { tags } from "typia";
import { v4 } from "uuid";
import { MyGlobal } from "../MyGlobal";
import { PasswordUtil } from "../utils/passwordUtil";
import { toISOStringSafe } from "../utils/toISOStringSafe";

import { ITodoListTodoListTask } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodoListTask";

export async function patchTodoListTodosId(props: {
  id: string & tags.Format<"uuid">;
  body: ITodoListTodoListTask.IUpdate;
}): Promise<ITodoListTodoListTask> {
  const task = await MyGlobal.prisma.todo_list_task.findUniqueOrThrow({
    where: { id: props.id },
  });

  const updated = await MyGlobal.prisma.todo_list_task.update({
    where: { id: props.id },
    data: {
      is_completed: props.body.is_completed,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    is_completed: updated.is_completed,
  };
}
