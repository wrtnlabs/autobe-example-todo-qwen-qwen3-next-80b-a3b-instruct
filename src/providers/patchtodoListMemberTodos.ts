import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListTodo";
import { IPageITodoListTodo } from "@ORGANIZATION/PROJECT-api/lib/structures/IPageITodoListTodo";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function patchtodoListMemberTodos(props: {
  member: MemberPayload;
  body: ITodoListTodo.IRequest;
}): Promise<IPageITodoListTodo> {
  const { member, body } = props;

  // Extract pagination parameters with defaults and validate ranges
  const page = Number(body.page ?? 1);
  const limit = Number(body.limit ?? 20);
  const skip = (page - 1) * limit;

  // Extract sort and order with defaults, ensuring only valid values are used
  const sortField = body.sort === "updated_at" ? "updated_at" : "created_at";
  const sortOrder = body.order === "asc" ? "asc" : "desc";

  // Build WHERE conditions using conditional spread for strict type safety
  const where = {
    todo_list_member_id: member.id,
    ...(body.search !== undefined &&
      body.search !== null && {
        title: { contains: body.search },
      }),
    ...(body.status !== undefined &&
      body.status !== null && {
        status: body.status,
      }),
    ...(body.created_after !== undefined &&
      body.created_after !== null &&
      body.created_before !== undefined &&
      body.created_before !== null && {
        created_at: {
          gte: body.created_after,
          lte: body.created_before,
        },
      }),
    ...(body.created_after !== undefined &&
      body.created_after !== null &&
      body.created_before === undefined &&
      body.created_before === null && {
        created_at: {
          gte: body.created_after,
        },
      }),
    ...(body.created_before !== undefined &&
      body.created_before !== null &&
      body.created_after === undefined &&
      body.created_after === null && {
        created_at: {
          lte: body.created_before,
        },
      }),
  };

  // Build orderBy object inline with strict type safety
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Execute queries in parallel with direct inline parameters
  const [todos, total] = await Promise.all([
    MyGlobal.prisma.todo_list_todos.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    MyGlobal.prisma.todo_list_todos.count({ where }),
  ]);

  // Return IPageITodoListTodo structure with proper typing
  return {
    pagination: {
      current: page,
      limit,
      records: total,
      pages: Math.ceil(total / limit),
    },
    data: todos,
  };
}
