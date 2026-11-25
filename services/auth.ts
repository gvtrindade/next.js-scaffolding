/**
 * Authentication service.
 *
 * The only place that talks to Better Auth on the server. Returns typed
 * results instead of throwing so server actions can decide what to show:
 * expected failures (bad credentials, unverified email, bad token) are not
 * reported to Sentry, everything else is.
 */

import * as Sentry from "@sentry/nextjs";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { requireEnv } from "@/lib/env";
import { auth } from "@/lib/auth";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export interface AuthServiceFailure {
  ok: false;
  status: number;
  /** Provider message. Empty when it is not safe to expose. */
  message: string;
}

export type AuthServiceResult = { ok: true } | AuthServiceFailure;

/** Statuses that mean "the caller did something wrong", not "we broke". */
const EXPECTED_STATUSES: ReadonlySet<number> = new Set([400, 401, 403, 404, 409, 422]);

function captureUnexpected(error: Error, operation: string): AuthServiceFailure {
  Sentry.captureException(error, { tags: { service: "auth", operation } });
  return { ok: false, status: 500, message: "" };
}

function toFailure(error: Error, operation: string): AuthServiceFailure {
  if (!isAPIError(error)) return captureUnexpected(error, operation);
  if (!EXPECTED_STATUSES.has(error.statusCode)) return captureUnexpected(error, operation);

  return { ok: false, status: error.statusCode, message: error.body?.message ?? "" };
}

async function run(operation: string, action: () => Promise<unknown>): Promise<AuthServiceResult> {
  try {
    await action();
    return { ok: true };
  } catch (error) {
    return toFailure(error instanceof Error ? error : new Error(String(error)), operation);
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    Sentry.captureException(error, { tags: { service: "auth", operation: "getSession" } });
    return null;
  }
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
}): Promise<AuthServiceResult> {
  return run("signInWithEmail", async () =>
    auth.api.signInEmail({
      body: { email: params.email, password: params.password },
      headers: await headers(),
    }),
  );
}

export async function signUpWithEmail(params: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthServiceResult> {
  return run("signUpWithEmail", async () =>
    auth.api.signUpEmail({
      body: { name: params.name, email: params.email, password: params.password },
      headers: await headers(),
    }),
  );
}

export async function requestPasswordReset(params: { email: string }): Promise<AuthServiceResult> {
  return run("requestPasswordReset", async () =>
    auth.api.requestPasswordReset({
      body: {
        email: params.email,
        redirectTo: `${requireEnv("APPLICATION_URL")}/reset-password`,
      },
    }),
  );
}

export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<AuthServiceResult> {
  return run("resetPassword", async () =>
    auth.api.resetPassword({
      body: { newPassword: params.newPassword, token: params.token },
    }),
  );
}
