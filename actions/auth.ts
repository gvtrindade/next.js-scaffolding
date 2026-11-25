"use server";

import * as Sentry from "@sentry/nextjs";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { normalizeName, validateEmail, validateName, validatePassword } from "@/lib/validation";
import {
  requestPasswordReset,
  resetPassword,
  signInWithEmail,
  signUpWithEmail,
} from "@/services/auth";

export interface AuthActionError {
  error: string;
}

export type AuthActionResult = AuthActionError | { success: true };

export async function loginAction(data: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  return Sentry.withServerActionInstrumentation(
    "loginAction",
    async (): Promise<AuthActionResult> => {
      const t = await getTranslations("Errors");
      const tv = await getTranslations("Validation");

      const validationError = validateEmail(data.email) ?? validatePassword(data.password);
      if (validationError) return { error: tv(validationError) };

      const result = await signInWithEmail({
        email: data.email.trim(),
        password: data.password,
      });
      if (!result.ok) return { error: t("invalidCredentials") };

      redirect("/protected");
    },
  );
}

export async function signupAction(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  return Sentry.withServerActionInstrumentation(
    "signupAction",
    async (): Promise<AuthActionResult> => {
      const t = await getTranslations("Errors");
      const tv = await getTranslations("Validation");

      const validationError =
        validateName(data.name) ?? validateEmail(data.email) ?? validatePassword(data.password);
      if (validationError) return { error: tv(validationError) };

      const result = await signUpWithEmail({
        name: normalizeName(data.name.trim()),
        email: data.email.trim(),
        password: data.password,
      });

      if (!result.ok) {
        return { error: result.status === 409 ? t("emailAlreadyRegistered") : t("signUpFailed") };
      }

      return { success: true };
    },
  );
}

export async function forgotPasswordAction(data: { email: string }): Promise<AuthActionResult> {
  return Sentry.withServerActionInstrumentation(
    "forgotPasswordAction",
    async (): Promise<AuthActionResult> => {
      const t = await getTranslations("Errors");
      const tv = await getTranslations("Validation");

      const validationError = validateEmail(data.email);
      if (validationError) return { error: tv(validationError) };

      const result = await requestPasswordReset({ email: data.email.trim() });
      if (!result.ok) return { error: t("generic") };

      return { success: true };
    },
  );
}

export async function resetPasswordAction(data: {
  token: string;
  newPassword: string;
}): Promise<AuthActionResult> {
  return Sentry.withServerActionInstrumentation(
    "resetPasswordAction",
    async (): Promise<AuthActionResult> => {
      const t = await getTranslations("Errors");
      const tv = await getTranslations("Validation");

      const validationError = validatePassword(data.newPassword);
      if (validationError) return { error: tv(validationError) };

      const result = await resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      });
      if (!result.ok) return { error: t("invalidResetToken") };

      return { success: true };
    },
  );
}
