import { ForbiddenException } from "@nestjs/common";

import { MyGlobal } from "../../MyGlobal";
import { jwtAuthorize } from "./jwtAuthorize";
import { UserPayload } from "../../decorators/payload/UserPayload";

export async function userAuthorize(request: {
  headers: {
    authorization?: string;
  };
}): Promise<UserPayload> {
  const payload: UserPayload = jwtAuthorize({ request }) as UserPayload;

  if (payload.type !== "user") {
    throw new ForbiddenException(`You're not ${payload.type}`);
  }

  // Since the Prisma schema shows todo_list_task as a standalone table
  // with no relationship to a user table, and there's only one user,
  // the JWT payload.id directly corresponds to the todo_list_task.id
  // in this singular-user application.
  
  // Query the todo_list_task table to verify existence
  const task = await MyGlobal.prisma.todo_list_task.findFirst({
    where: {
      id: payload.id
    }
  });

  if (task === null) {
    throw new ForbiddenException("You're not enrolled");
  }

  return payload;
}