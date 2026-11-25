"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { signupAction } from "@/actions/auth";
import { AuthFooterLink } from "../components/auth-footer-link";
import { GoogleSignInButton } from "../components/google-sign-in-button";
import { OrDivider } from "../components/or-divider";
import { PageHeader } from "@/components/page-header";
import { PasswordStrength } from "@/components/password-strength";
import { PasswordInput } from "@/components/password-input";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  normalizeName,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from "@/lib/validation";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const t = useTranslations("Register");
  const tv = useTranslations("Validation");
  const ta = useTranslations("Auth");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = (data: RegisterForm) => {
    setError(null);
    startTransition(async () => {
      const result = await signupAction({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  };

  if (sent) {
    return (
      <Card>
        <PageHeader title={t("verifyEmailTitle")} description={t("verifyEmailDescription")} />
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
            id="name"
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            error={errors.name?.message}
            {...register("name", {
              validate: (value) => {
                const validationKey = validateName(value);
                return validationKey ? tv(validationKey) : true;
              },
              setValueAs: (value: string) => normalizeName(value),
            })}
          />
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
          <div className="space-y-2">
            <PasswordInput
              id="password"
              label={t("passwordLabel")}
              placeholder={t("passwordPlaceholder")}
              error={errors.password?.message}
              {...register("password", {
                validate: (value) => {
                  const validationKey = validatePassword(value);
                  return validationKey ? tv(validationKey) : true;
                },
              })}
            />
            <PasswordStrength value={password} />
          </div>
          <PasswordInput
            id="confirmPassword"
            label={t("confirmPasswordLabel")}
            placeholder={t("confirmPasswordPlaceholder")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              validate: (value) => {
                const validationKey = validatePasswordConfirmation(password, value);
                return validationKey ? tv(validationKey) : true;
              },
            })}
          />
          {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
        <OrDivider />
        <GoogleSignInButton />
      </CardContent>
      <AuthFooterLink prompt={t("haveAccount")} linkLabel={t("signInLink")} href="/login" />
    </Card>
  );
}
