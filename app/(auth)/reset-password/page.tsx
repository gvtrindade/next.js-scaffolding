"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { resetPasswordAction } from "@/actions/auth";
import { AuthFooterLink } from "../components/auth-footer-link";
import { PageHeader } from "@/components/page-header";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrength } from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validatePassword, validatePasswordConfirmation } from "@/lib/validation";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordFormContent />
    </Suspense>
  );
}

function ResetPasswordFormContent() {
  const t = useTranslations("ResetPassword");
  const tv = useTranslations("Validation");
  const ta = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) {
      setError(t("invalidToken"));
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        newPassword: data.newPassword,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      router.push("/login");
    });
  };

  if (!token) {
    return (
      <Card>
        <PageHeader title={t("invalidLinkTitle")} description={t("invalidLinkDescription")} />
        <AuthFooterLink linkLabel={t("requestNewLink")} href="/forgot-password" />
      </Card>
    );
  }

  return (
    <Card>
      <PageHeader title={t("title")} description={t("description")} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <PasswordInput
              id="newPassword"
              label={t("newPasswordLabel")}
              placeholder={t("newPasswordPlaceholder")}
              error={errors.newPassword?.message}
              {...register("newPassword", {
                validate: (value) => {
                  const validationKey = validatePassword(value);
                  return validationKey ? tv(validationKey) : true;
                },
              })}
            />
            <PasswordStrength value={newPassword} />
          </div>
          <PasswordInput
            id="confirmPassword"
            label={t("confirmPasswordLabel")}
            placeholder={t("confirmPasswordPlaceholder")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              validate: (value) => {
                const validationKey = validatePasswordConfirmation(newPassword, value);
                return validationKey ? tv(validationKey) : true;
              },
            })}
          />
          {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </CardContent>
      <AuthFooterLink linkLabel={ta("backToLogin")} href="/login" />
    </Card>
  );
}
