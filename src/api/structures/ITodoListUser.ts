import { tags } from "typia";

import { IAuthorizationToken } from "./IAuthorizationToken";

export namespace ITodoListUser {
  /**
   * Authorization response containing JWT token for the single-user TodoList
   * application.
   *
   * This type defines the structure of the response returned from join,
   * login, and refresh operations. Despite the requirement for authorization
   * operations due to the 'member' role specification, the underlying Prisma
   * schema contains no user authentication data. This type therefore does not
   * represent a real user entity but rather a temporary client-side session
   * context identifier. It aligns with the application's design principle of
   * being a single-user, locally persistent tool with no authentication,
   * accounts, or user identity management.
   */
  export type IAuthorized = {
    /**
     * Unique identifier for the session context in the TodoList
     * application.
     *
     * Since the system operates with no user authentication or accounts,
     * this ID represents a temporary client-side session context. It is not
     * linked to any user record in the database as no user entity exists in
     * the Prisma schema. The value is cryptographically generated upon join
     * or refresh and used by the client to maintain task state between
     * sessions.
     */
    id: string & tags.Format<"uuid">;

    /** JWT token information for authentication */
    token: IAuthorizationToken;
  };
}
