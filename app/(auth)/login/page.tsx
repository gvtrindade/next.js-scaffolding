"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthFooterLink } from "../components/auth-footer-link";
import { GoogleSignInButton } from "../components/google-sign-in-button";
import { OrDivider } from "../components/or-divider";
import { PageHeader } from "@/components/page-header";
import { PasswordInput } from "@/components/password-input";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateEmail } from "@/lib/validation";
import { authClient } from "@/lib/auth-client";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations("Login");
  const tv = useTranslations("Validation");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginForm>();

  const email = useWatch({ control, name: "email" }) ?? "";

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setEmailNotVerified(false);
    setIsPending(true);
    const { error: authError } = await authClient.signIn.email({
      email: data.email.trim(),
      password: data.password,
    });
    setIsPending(false);

    if (!authError) {
      router.replace("/protected");
      return;
    }

    if (authError.status === 403) {
      setEmailNotVerified(true);
      setError(t("accountNotVerified"));
    } else {
      setError(t("invalidCredentials"));
    }
  };

  const handleResendVerification = async () => {
    setResendState("sending");
    const { error: resendError } = await authClient.sendVerificationEmail({
      email: email.trim(),
      callbackURL: "/email-verified",
    });
    setResendState(resendError ? "error" : "sent");
  };

  return (
    <Card>
      <PageHeader title={t("title")} description={t("description")} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            id="email"
            type="email"
            label={t("emailLabel")}
            placeholder={t("emailPlaceholder")}
            error={errors.email?.message}
            {...register("email", {
              validate: (value) => {
                const validationKey = validateEmail(value);
                return validationKey ? tv(validationKey) : true;
              },
            })}
          />
          <PasswordInput
            id="password"
            label={t("passwordLabel")}
            placeholder={t("passwordPlaceholder")}
            error={errors.password?.message}
            action={
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            }
            {...register("password", { required: tv("passwordRequired") })}
          />
          {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
          {emailNotVerified ? (
            <div className="text-center space-y-2">
              {resendState === "sent" ? (
                <p className="text-sm text-green-600">{t("resentSuccess")}</p>
              ) : resendState === "error" ? (
                <p className="text-sm text-destructive">{t("resentError")}</p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={resendState === "sending"}
                  onClick={handleResendVerification}
                >
                  {resendState === "sending" ? t("sending") : t("resendVerification")}
                </Button>
              )}
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
        <OrDivider />
        <GoogleSignInButton />
      </CardContent>
      <AuthFooterLink prompt={t("noAccount")} linkLabel={t("signUpLink")} href="/register" />
    </Card>
  );
}
