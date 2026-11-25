import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}

/** Mirrors the props Next passes to `onRequestError`. */
interface ErrorRequest {
  path: string;
  method: string;
  headers: NodeJS.Dict<string | string[]>;
}

interface ErrorRequestContext {
  routerKind: "Pages Router" | "App Router";
  routePath: string;
  routeType: "render" | "route" | "action" | "proxy";
  renderSource?: "react-server-components" | "react-server-components-payload" | "server-rendering";
  revalidateReason?: "on-demand" | "stale";
}

function toHeaders(source: NodeJS.Dict<string | string[]>): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (value) {
      headers.set(key, value.join(", "));
    }
  }

  return headers;
}

export async function onRequestError(
  error: unknown,
  request: ErrorRequest,
  context: ErrorRequestContext,
) {
  // The Prisma-dependent imports stay inside this branch so the Edge
  // instrumentation bundle never pulls in Node modules.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { getSessionCookie } = await import("better-auth/cookies");
      const { findSessionUserByToken } = await import("@/services/session");

      const token = getSessionCookie(toHeaders(request.headers));
      if (token) {
        const user = await findSessionUserByToken(token);
        if (user) {
          Sentry.setUser({ id: user.id, email: user.email });
        }
      }
    } catch (sessionError) {
      Sentry.captureException(sessionError, {
        tags: { scope: "instrumentation", operation: "attachSessionUser" },
      });
    }
  }

  Sentry.captureRequestError(error, request, context);
}
