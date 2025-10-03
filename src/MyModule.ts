import { Module } from "@nestjs/common";

import { AuthUserController } from "./controllers/auth/user/AuthUserController";
import { TodolistTodosController } from "./controllers/todoList/todos/TodolistTodosController";

@Module({
  controllers: [AuthUserController, TodolistTodosController],
})
export class MyModule {}
