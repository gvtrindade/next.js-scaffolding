/**
 * Session lookups that do not depend on request context (used by
 * `instrumentation.ts`, where `headers()` is not available).
 */

import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "@/lib/prisma";

export type SessionUser = Prisma.UserGetPayload<{
  select: { id: true; email: true };
}>;

export async function findSessionUserByToken(token: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    select: { user: { select: { id: true, email: true } } },
  });

  return session?.user ?? null;
}
