import { HttpException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import typia, { tags } from "typia";
import { v4 } from "uuid";
import { MyGlobal } from "../MyGlobal";
import { PasswordUtil } from "../utils/passwordUtil";
import { toISOStringSafe } from "../utils/toISOStringSafe";

export async function deleteTodoListTodosId(props: {
  id: string & tags.Format<"uuid">;
}): Promise<void> {
  await MyGlobal.prisma.todo_list_task.delete({
    where: {
      id: props.id,
    },
  });
}
