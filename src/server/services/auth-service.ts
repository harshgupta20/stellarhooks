import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";

const SALT_ROUNDS = 10;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Errors.conflict("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, name: data.name, hashedPassword },
    select: { id: true, email: true, name: true },
  });

  return user;
}

/**
 * Verify email + password. Returns the public user on success, or null on any
 * failure (kept generic to avoid leaking which part was wrong).
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) return null;

  return { id: user.id, email: user.email, name: user.name };
}
