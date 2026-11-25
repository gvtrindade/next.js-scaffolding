"use client";

import { useTranslations } from "next-intl";
import { PASSWORD_RULES, metPasswordRequirements } from "@/lib/validation";

interface PasswordStrengthProps {
  value: string;
}

/** Strength meter driven by the shared password policy in `lib/validation.ts`. */
export function PasswordStrength({ value }: PasswordStrengthProps) {
  const t = useTranslations("PasswordStrength");

  const metRequirements = metPasswordRequirements(value);
  const percentage = (metRequirements / PASSWORD_RULES.length) * 100;

  const barColor =
    metRequirements <= 1
      ? "bg-destructive"
      : metRequirements <= 3
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);

          return (
            <li
              key={rule.labelKey}
              className={`text-xs ${met ? "text-emerald-500" : "text-muted-foreground"}`}
            >
              {met ? "✓ " : "✗ "}
              {t(rule.labelKey)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
