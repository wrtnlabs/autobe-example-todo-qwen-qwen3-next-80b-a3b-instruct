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

  // Extract pagination parameters with defaults
  const page = body.page ?? 1;
  const limit = body.limit ?? 20;
  const skip = (page - 1) * limit;

  // Build where conditions
  const where: Record<string, any> = {
    todo_list_member_id: member.id,
  };

  // Add status filter if provided
  if (body.status !== undefined) {
    where.status = body.status;
  }

  // Add search filter for title if provided
  if (body.search !== undefined) {
    where.title = { contains: body.search };
  }

  // Add date range filters for created_at if provided
  if (body.created_after !== undefined) {
    if (!where.created_at) where.created_at = {};
    where.created_at.gte = body.created_after;
  }

  if (body.created_before !== undefined) {
    if (!where.created_at) where.created_at = {};
    where.created_at.lte = body.created_before;
  }

  // Build orderBy clause with defaults
  const orderBy: Record<string, any> = {};
  const sortField = body.sort ?? "created_at";
  const sortOrder = body.order ?? "desc";
  orderBy[sortField] = sortOrder;

  // Execute queries
  const [todos, total] = await Promise.all([
    MyGlobal.prisma.todo_list_todos.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    MyGlobal.prisma.todo_list_todos.count({ where }),
  ]);

  // Convert all DateTime fields from Date objects to ISO strings
  const formattedTodos: ITodoListTodo[] = todos.map((todo) => ({
    id: todo.id,
    todo_list_member_id: todo.todo_list_member_id,
    title: todo.title,
    status: todo.status,
    created_at: toISOStringSafe(todo.created_at),
    updated_at: toISOStringSafe(todo.updated_at),
  }));

  // Format response
  return {
    pagination: {
      current: Number(page),
      limit: Number(limit),
      records: total,
      pages: Math.ceil(total / limit),
    },
    data: formattedTodos,
  };
}
