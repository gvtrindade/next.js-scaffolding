import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/services/email";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const applicationUrl = requireEnv("APPLICATION_URL");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/auth",
  baseURL: applicationUrl,
  secret: requireEnv("BETTER_AUTH_SECRET"),
  user: {
    additionalFields: {
      roles: {
        type: "string[]",
        required: true,
        defaultValue: [],
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, url });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${applicationUrl}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent("/email-verified")}`;
      // Delivery failures are already reported to Sentry by the email service;
      // they must not fail the auth flow (the user can request a new link).
      try {
        await sendVerificationEmail({ to: user.email, url: verifyUrl });
      } catch {
        // Intentionally ignored: see above.
      }
    },
  },
  socialProviders: {
    google: {
      clientId: requireEnv("AUTH_GOOGLE_ID"),
      clientSecret: requireEnv("AUTH_GOOGLE_SECRET"),
    },
  },
});
