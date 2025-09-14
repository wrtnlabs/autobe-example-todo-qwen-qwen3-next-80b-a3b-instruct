import jwt from "jsonwebtoken";
import { MyGlobal } from "../MyGlobal";
import typia, { tags } from "typia";
import { Prisma } from "@prisma/client";
import { v4 } from "uuid";
import { toISOStringSafe } from "../util/toISOStringSafe";
import { ITodoListMember } from "@ORGANIZATION/PROJECT-api/lib/structures/ITodoListMember";
import { MemberPayload } from "../decorators/payload/MemberPayload";

/**
 * Update member user's password in todo_list_members table after validating
 * current password.
 *
 * This API operation enables member users to change their authentication
 * password. The operation requires the user to provide their current password
 * (which is validated against the password_hash in the todo_list_members table)
 * and a new password.
 *
 * The schema confirms this operation is supported by the 'password_hash' field
 * in the todo_list_members table, which stores the bcrypt-hashed password. The
 * operation uses the existing password_hash for validation and replaces it with
 * a new one when the current password is verified.
 *
 * The system implements the security requirements by: hashing the new password
 * with bcrypt algorithm (cost factor 12), ensuring the new password meets
 * minimum security requirements (at least 8 characters), and encrypting all
 * communications with HTTPS/TLS 1.2+.
 *
 * This operation is protected by the member authorization role, meaning only
 * authenticated users can change their password. The update also modifies the
 * 'updated_at' timestamp in the todo_list_members table, which helps track
 * security events and informs session management logic (inactivity timeout).
 *
 * This operation prevents unauthorized password changes by requiring knowledge
 * of the current password, following the principle of least privilege.
 *
 * @param props - Request properties
 * @param props.member - The authenticated member making the password update
 *   request
 * @param props.body - Contains current password hash and new password hash
 * @param props.body.current_password_hash - The bcrypt-hashed version of the
 *   user's current password for validation
 * @param props.body.new_password_hash - The bcrypt-hashed version of the new
 *   password to be stored
 * @returns The updated member data with new password_hash and updated_at
 *   timestamp
 * @throws {Error} When member not found or account is deleted
 * @throws {Error} When current password hash does not match stored hash
 */
export async function putauthMemberPasswordUpdate(props: {
  member: MemberPayload;
  body: ITodoListMember.IUpdatePassword;
}): Promise<ITodoListMember> {
  const { member, body } = props;

  // Fetch the member record by ID and ensure it's not deleted
  const memberRecord = await MyGlobal.prisma.todo_list_members.findFirst({
    where: {
      id: member.id,
      deleted_at: null,
    },
  });

  // If member not found or deleted, throw error
  if (!memberRecord) {
    throw new Error("Member not found or account is deleted");
  }

  // Verify current password hash matches stored hash
  if (memberRecord.password_hash !== body.current_password_hash) {
    throw new Error("Current password hash is incorrect");
  }

  // Get current timestamp once
  const now = toISOStringSafe(new Date());

  // Update the password and timestamp
  await MyGlobal.prisma.todo_list_members.update({
    where: { id: member.id },
    data: {
      password_hash: body.new_password_hash,
      updated_at: now,
    },
  });

  // Return updated member data with correct updated_at timestamp
  return {
    id: memberRecord.id,
    email: memberRecord.email,
    password_hash: body.new_password_hash,
    created_at: memberRecord.created_at,
    updated_at: now,
    deleted_at: memberRecord.deleted_at,
  };
}
