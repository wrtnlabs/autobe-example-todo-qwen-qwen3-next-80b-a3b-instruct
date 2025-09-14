import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

export async function postauthMemberLogin(props: {
  member: MemberPayload;
  body: ITodoListMember.ILogin;
}): Promise<ITodoListMember.IAuthorized> {
  const { email, password_hash } = props.body;

  // Find user by email with soft delete check
  const user = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      email: email,
      deleted_at: null,
    },
  });

  // If user not found or password doesn't match, throw generic error
  if (
    !user ||
    !(await MyGlobal.password.verify(password_hash, user.password_hash))
  ) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT access token with 30-minute expiration
  const accessToken = jwt.sign(
    {
      userId: user.id,
    },
    MyGlobal.env.JWT_SECRET_KEY,
    {
      expiresIn: "30m",
      issuer: "autobe",
    },
  );

  // Generate JWT refresh token with 7-day expiration
  const refreshToken = jwt.sign(
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

  // Calculate expiration times
  const now = new Date();
  const expired_at = toISOStringSafe(new Date(now.getTime() + 30 * 60 * 1000)); // 30 minutes from now
  const refreshable_until = toISOStringSafe(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  ); // 7 days from now

  // Return IAuthorized response
  const response: ITodoListMember.IAuthorized = {
    id: user.id,
    token: {
      access: accessToken,
      refresh: refreshToken,
      expired_at,
      refreshable_until,
    },
  };

  // Validate response conforms to IAuthorized type
  typia.assert<ITodoListMember.IAuthorized>(response);

  return response;
}
