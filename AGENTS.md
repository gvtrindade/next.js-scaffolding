# AGENTS.md

Guidance for AI agents working in this repository.

## What this is

`conduit_redux` — a Next.js 16 (App Router, React 19, RSC) starter/template with:

- **Prisma 7** + PostgreSQL (`@prisma/adapter-pg`), client generated to `prisma/generated/`
- **Better Auth** (`better-auth`) with email/password + Google OAuth, email verification, password reset
- **Resend** for transactional email
- **next-intl** for i18n (cookie-based locale, no URL prefix)
- **Sentry** (@sentry/nextjs) reporting to GlitchTip
- **Serwist** PWA (service worker at `app/sw.ts`)
- **shadcn/ui** on top of **@base-ui/react** (`components.json` style `base-nova`)
- **Tailwind v4** (CSS-first config in `app/globals.css`), **react-hook-form**
- **Vitest** for unit tests, **Prettier** for formatting

## Commands

```bash
pnpm dev                                  # dev server
pnpm build                                # production build
pnpm lint                                 # eslint .
pnpm typecheck                            # tsc --noEmit
pnpm test                                 # vitest run
pnpm format                               # prettier --write .
pnpm dlx prisma generate                  # after any schema change
pnpm dlx prisma migrate dev --name <name> # create + apply a migration
docker compose up -d db                   # local Postgres (compose.yaml)
```

Package manager is **pnpm**. ESM only (`"type": "module"`). Import alias `@/*` → repo root.

## Layout

```
app/(auth)/              auth pages (login, register, forgot/reset password, email-verified)
app/(auth)/components/   markup shared by the auth pages (dividers, OAuth button, footer link)
app/(main)/              authenticated pages
app/api/auth/[...all]/route.ts   Better Auth handler
actions/                 "use server" actions — thin: validate → call service → return result
services/                the only place with Prisma, better-auth API, Resend, fetch, SDK calls
lib/                     infrastructure: auth config, auth-client, prisma, env, validation,
                         email templates, utils
components/ui/           shadcn primitives — generated, avoid hand-editing
components/              app components; `page-header`, `form-field`, `text-input` are generic
prisma/schema.prisma     single source of truth for models
prisma/generated/        generated client — committed, never edit by hand
messages/<locale>.json   translations
```

Data flow, always in this direction:

```
page/component → action (server) or lib/auth-client.ts (client) → service → Prisma / SDK
```

## Rules

### 1. UI: build on shadcn components

- Use existing primitives from `components/ui/` (`Button`, `Input`, `Label`, `Card`, …). Never re-style a raw `<button>`/`<input>`.
- Use the generic components in `components/` instead of re-writing their markup:
  - `PageHeader` — title + description block (every card/page header),
  - `FormField` — label + control + error message, for any control,
  - `TextInput` — `FormField` + `Input`, for text fields (supports `endAdornment`),
  - `PasswordInput` — `TextInput` + show/hide toggle; always use it for passwords.
- Add missing primitives with `pnpm dlx shadcn@latest add <name>` — do not copy from the web.
- This registry is **base-ui**, not Radix: there is no `asChild`. Use base-ui's `render` prop (e.g. `<Button render={<Link href="/x" />}>`) and `data-*`/`aria-*` variants as the existing components do.
- Compose with `cn()` from `lib/utils.ts`. Prefer theme tokens (`bg-panel`, `text-cream`, `text-destructive`, `border-border-custom`, …) over raw hex/`slate-500` values; dark mode is class-based.
- Icons: `lucide-react`.

### 2. Errors go to Sentry

- Every `"use server"` action must be wrapped in `Sentry.withServerActionInstrumentation("<actionName>", …)` (see `actions/auth.ts`).
- Services own failure reporting: `try/catch`, `Sentry.captureException(error, { tags: { service, operation } })`, then return a typed result or throw a domain error. Do not swallow errors and do not return bare `null` on failure.
- Expected user errors (bad credentials, invalid token, duplicate email) are **not** exceptions: return a typed failure and let the action translate it. Don't push `4xx` validation noise into Sentry.
- Errors crossing to the client must be user-safe strings: never leak `error.message` from libraries/Prisma/DB. Translate via `getTranslations("Errors")` (server) or `useTranslations("Errors")` (client).
- `instrumentation.ts` reports every request error through `Sentry.captureRequestError`; don't add a second capture for the same error.

### 3. No `any`, no `unknown` — find the real type

- `tsconfig.json` is `strict: true`. Do not introduce `any`, `as any`, `@ts-ignore`, or widen to `unknown` to make a build pass.
- Get types from the source of truth:
  - Prisma models: `Prisma.UserGetPayload<{ select: … }>` or the generated model types (`@/prisma/generated/models/User`). Never re-declare a DB shape by hand.
  - Auth: `AuthSession` from `services/auth.ts` (`typeof auth.api.getSession`) and `authClient.$Infer.Session` on the client.
  - Errors: `isAPIError`/`APIError` from `better-auth/api`, `EmailDeliveryError` from `services/email.ts`, `CreateEmailResponse` from `resend`.
  - Next instrumentation: `ErrorRequest`/`ErrorRequestContext` in `instrumentation.ts` mirror Next's own types (Next 16 exports no public `Instrumentation` type).
- Actions declare explicit return types (`Promise<AuthActionResult>`), never `Promise<any>`.
- Environment config goes through `lib/env.ts` (`requireEnv`/`optionalEnv`) — no `as string` casts on `process.env`.

### 4. Backend/library calls belong in a service

- `actions/*.ts` = thin orchestration: validate input, call service, map the result. No `prisma.*`, no `fetch`, no SDK calls inline.
- Server-side backend access lives in `services/<domain>.ts` (`services/auth.ts`, `services/email.ts`, `services/session.ts`), exporting plain async functions typed against Prisma/Better Auth/Resend types.
- Client-side backend access goes through `lib/auth-client.ts` (`authClient.*`). Never `fetch("/api/…")` by hand when the SDK offers the call.
- Prisma is imported from `@/lib/prisma` (the singleton) — never `new PrismaClient()`.
- Email has two layers: `lib/email-templates.ts` (markup + text, no provider) and `services/email.ts` (delivery + error handling). Keep them separate.

### 5. Minimal diffs

- Implement the change in the fewest files/edits that solve it. Don't reformat untouched code, don't rename unrelated symbols, don't "while I'm here" refactor.
- No new dependencies unless required; no wholesale re-writes of working files.
- Run `pnpm format` on the files you touch, not the whole repo (the repo was bulk-formatted once, on purpose; don't repeat that in a feature change).
- Match the surrounding file's style; Prettier config (`.prettierrc`) is the source of truth:  semicolons, double quotes, 100 columns.

### 6. Components ≤ 300 lines

- If a component approaches 300 lines, extract cohesive pieces into their own file in `components/` (not `components/ui/`, which is generated). Page-local shared markup goes in the route group's `components/` folder (e.g. `app/(auth)/components/`).
- Extract by responsibility: form fields, dividers, submit buttons, empty/error states — not by cutting a render tree in half arbitrarily.
- Hooks/state stay in the parent; presentational subcomponents take explicit props.
- **Extract on the second use.** If a block is needed twice, extract it; never write a third copy.

### 7. Every user-facing string is translated

- Nothing hardcoded in JSX, `placeholder`, `aria-label`, `title`, page `metadata`, email bodies, or toast/error text.
- Namespaces keyed by feature in `messages/<locale>.json`: `Auth` (shared auth text), `Login`, `Register`, `ForgotPassword`, `ResetPassword`, `EmailVerified`, `Protected`, `Errors`, `Validation`, `PasswordStrength`, `Emails.<template>`, `Metadata`.
- Put text used by more than one page in the shared namespace (`Auth`), not in each feature namespace.
- Server: `const t = await getTranslations("Namespace")`. Client: `const t = useTranslations("Namespace")`.
- When adding a key, add it to **every** file in `messages/` (currently only `en.json`) — missing keys throw at runtime.
- Reuse existing `Errors.*` / `Validation.*` keys before inventing new ones.

### 8. One Prisma changelog per commit

- Squash schema/migration changes into **one** migration before committing: `pnpm dlx prisma migrate dev --name <one-descriptive-name>`.
- Never commit several migrations created during one task; delete the intermediate ones and regenerate, or reset the dev DB.
- Then run `pnpm dlx prisma generate` so `prisma/generated/` matches.
- `prisma/migrations/` is append-only history — never edit an applied migration.

### 9. Validation is shared, never duplicated

- All input rules live in `lib/validation.ts` and return a key from the `Validation` translation namespace (`"emailInvalid"`, `"symbolRequired"`, …) or `null`.
- The same validators run on the client (`react-hook-form` `validate`) and on the server (in the action) — the server is authoritative, the client is only UX.
- `PASSWORD_RULES` is the single password policy: used by the strength meter, the register/reset forms and the actions. Never inline a regex for email, name or password anywhere else.
- Server actions validate every field they receive before calling a service; the client can send anything.

### 10. Environment variables

- All access goes through `requireEnv`/`optionalEnv` in `lib/env.ts`. No `process.env.X!`, no `as string`.
- Canonical names: `APPLICATION_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, `RESEND_SENDER`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`.
- The DSN fallback `SENTRY_DNS` in the Sentry configs is a legacy typo — don't propagate it.
- A new variable means: `example.env` entry + use of `requireEnv`.
- Read env vars lazily (inside functions) when they are only needed at request time, so builds and cold paths don't fail on missing config.

### 11. Tests

- Vitest, node environment, `*.test.ts` next to the code (`lib/validation.test.ts`). `vitest.config.ts` maps `@/*`.
- Required for pure logic: validators, formatters, service result mapping. Not required for presentational components/pages.
- Run `pnpm test` before finishing; add a test when you add a rule to `lib/validation.ts`.

## Gotchas (verified in this codebase)

- **Prisma client import path** is `@/prisma/generated/client` (custom `output`), _not_ `@prisma/client`. The datasource `url` is intentionally absent from `schema.prisma` — it comes from `DATABASE_URL` via `prisma.config.ts`. Don't add `url = env("DATABASE_URL")`.
- **`prisma/generated/` is committed.** Do not add it to `.gitignore` (it is only ignored because of a stale line — keep it tracked) and do not edit it by hand.
- `lib/prisma.ts` keeps one client on `globalThis.__prisma` so dev hot reloads don't leak pools. `lib/auth.ts` reuses it; any new module must too.
- **`redirect()` throws** by design: keep it outside `try/catch`, or the navigation gets swallowed.
- The login form uses `authClient.signIn.email` directly (it needs the `403` "email not verified" status). `loginAction` exists for server-side redirects and is currently unused — don't delete it without checking with the user.
- `instrumentation.ts` must keep its Prisma-dependent imports **inside** the `process.env.NEXT_RUNTIME === "nodejs"` branch, otherwise the Edge instrumentation bundle pulls in `node:path`/`node:url` and the build warns.
- Resend's `emails.send` returns `{ data, error }` and does not throw; `services/email.ts` handles both. Email delivery failures are reported to Sentry but must never fail an auth flow (verification/reset links can be re-requested).
- `instrumentation.ts` intentionally captures nothing additional for `/api/auth/[...all]`; the earlier double capture was a bug.
- Locale comes from the `locale` cookie (`i18n/request.ts`); there is no `/en/...` routing. Don't add locale segments to links.
- `app/sw.ts` precaches `/missions` and `/profile`, which do not exist yet, and per-entry `revision` uses `crypto.randomUUID()` (TODO in the file). Don't "fix" this without asking.
- `.env*` is gitignored; `example.env` is the contract for required vars.

## Before you finish

1. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
2. No `any`/`unknown`/`@ts-ignore` added; no `console.log`; no untranslated UI text.
3. Server actions instrumented; new failure paths captured in Sentry; no provider messages leaked to users.
4. Backend calls are in `services/` (or `lib/auth-client.ts` on the client), not in components/actions.
5. Component line counts still ≤ 300; no text block duplicated a third time.
6. New rules added to `lib/validation.ts` with a test; new env var in `example.env`.
7. `prisma generate` (and one squashed migration) if the schema changed.
8. `pnpm format` applied to the touched files only.
