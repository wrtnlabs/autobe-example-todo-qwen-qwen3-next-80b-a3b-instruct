import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

/**
 * Authenticate member user and issue JWT access token using email and password
 * hash from todo_list_members table.
 *
 * This API operation authenticates member users by validating their credentials
 * against the todo_list_members table. When a user attempts to log in, the
 * system checks if an email exists in the database and if the provided
 * password_hash matches the stored value using bcrypt algorithm.
 *
 * The schema confirms this operation is supported by the 'email' and
 * 'password_hash' fields in the todo_list_members table, which store user
 * credentials. The 'created_at' and 'updated_at' fields are used for session
 * management and inactivity timeout logic.
 *
 * The system implements security best practices by not disclosing whether an
 * email exists in the system when authentication fails. It implements a
 * 30-minute session timeout as specified in the business requirements, where
 * the issued JWT token expires after 30 minutes.
 *
 * This operation is essential for member users to access their todo items.
 * After successful authentication, the user receives a JWT token containing
 * their userId and role information (member). The token must be included in
 * subsequent requests to authorize access to private resources.
 *
 * @param props - Request properties
 * @param props.body - Contains the email address and password hash for
 *   authenticating a member user
 * @returns The authentication token and user information after successful login
 * @throws {Error} When the provided email does not exist in the system
 * @throws {Error} When the provided password hash does not match the stored
 *   hash
 */
export async function postauthMemberLogin(props: {
  member: MemberPayload;
  body: ITodoListMember.ILogin;
}): Promise<ITodoListMember.IAuthorized> {
  const { email, password_hash } = props.body;

  // Query for user with matching email and active status
  const user = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      email,
      deleted_at: null,
    },
  });

  // Validate user exists and password matches
  if (
    !user ||
    !(await MyGlobal.password.verify(password_hash, user.password_hash))
  ) {
    throw new Error("Invalid email or password");
  }

  // Generate access token with 30-minute expiration
  const access_token = jwt.sign(
    {
      userId: user.id,
      type: "member",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "30m",
      issuer: "autobe",
    },
  );

  // Generate refresh token with 7-day expiration
  const refresh_token = jwt.sign(
    {
      userId: user.id,
      tokenType: "refresh",
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
      issuer: "autobe",
    },
  );

  // Generate proper date-time strings using toISOStringSafe
  const now = new Date();
  const expired_at = toISOStringSafe(new Date(now.getTime() + 30 * 60 * 1000));
  const refreshable_until = toISOStringSafe(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  );

  // Return properly typed response
  return {
    id: user.id,
    token: {
      access: access_token,
      refresh: refresh_token,
      expired_at,
      refreshable_until,
    },
  };
}
