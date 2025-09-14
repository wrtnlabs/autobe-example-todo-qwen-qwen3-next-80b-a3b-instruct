import { Module } from "@nestjs/common";

import { AuthMemberController } from "./controllers/auth/member/AuthMemberController";
import { AuthMemberPasswordUpdateController } from "./controllers/auth/member/password/update/AuthMemberPasswordUpdateController";
import { AuthMemberPasswordResetRequestController } from "./controllers/auth/member/password/reset/request/AuthMemberPasswordResetRequestController";
import { AuthMemberPasswordResetCompleteController } from "./controllers/auth/member/password/reset/complete/AuthMemberPasswordResetCompleteController";
import { TodolistMemberTodosController } from "./controllers/todoList/member/todos/TodolistMemberTodosController";

@Module({
  controllers: [
    AuthMemberController,
    AuthMemberPasswordUpdateController,
    AuthMemberPasswordResetRequestController,
    AuthMemberPasswordResetCompleteController,
    TodolistMemberTodosController,
  ],
})
export class MyModule {}
