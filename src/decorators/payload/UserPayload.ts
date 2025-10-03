import { tags } from "typia";

export interface UserPayload {
  /**
   * The top-level user table ID. In this single-user application, this
   * corresponds to the todo_list_task.id since there is no separate user
   * table.
   */
  id: string & tags.Format<"uuid">;

  /** Discriminator for the discriminated union type. */
  type: "user";
}
