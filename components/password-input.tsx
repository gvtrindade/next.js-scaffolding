"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TextInput } from "@/components/text-input";
import { Button } from "@/components/ui/button";
import type * as React from "react";

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "id" | "type"> {
  id: string;
  label: string;
  /** Already translated validation message. */
  error?: string;
  /** Right-aligned element next to the label. */
  action?: React.ReactNode;
  containerClassName?: string;
}

/** Password field with a show/hide toggle. */
export function PasswordInput({
  id,
  label,
  error,
  action,
  containerClassName,
  ...inputProps
}: PasswordInputProps) {
  const t = useTranslations("PasswordInput");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextInput
      id={id}
      label={label}
      error={error}
      action={action}
      containerClassName={containerClassName}
      type={isVisible ? "text" : "password"}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={isVisible ? t("hide") : t("show")}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </Button>
      }
      {...inputProps}
    />
  );
}
