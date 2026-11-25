"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { forgotPasswordAction } from "@/actions/auth";
import { AuthFooterLink } from "../components/auth-footer-link";
import { PageHeader } from "@/components/page-header";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateEmail } from "@/lib/validation";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("Validation");
  const ta = useTranslations("Auth");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = (data: ForgotPasswordForm) => {
    setError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(data);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setSent(true);
    });
  };

  if (sent) {
    return (
      <Card>
        <PageHeader title={t("sentTitle")} description={t("sentDescription")} />
        <AuthFooterLink linkLabel={ta("backToLogin")} href="/login" />
      </Card>
    );
  }

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
