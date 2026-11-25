/**
 * Shared validation rules.
 *
 * Every validator returns a key from the `Validation` translation namespace, or
 * `null` when the value is valid. Keeping the keys (instead of messages) lets
 * the same rule run on the client (react-hook-form) and on the server
 * (server actions) while the caller resolves the user-facing text.
 */

export const EMAIL_PATTERN = /^\S+@\S+$/i;
export const FULL_NAME_PATTERN = /^\s*\S+(?:\s+\S+)+\s*$/;

export const NAME_MIN_LENGTH = 2;
export const PASSWORD_MIN_LENGTH = 8;

export type ValidationKey =
  | "emailRequired"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordMinLength"
  | "lowercaseRequired"
  | "uppercaseRequired"
  | "numberRequired"
  | "symbolRequired"
  | "confirmPasswordRequired"
  | "passwordsMismatch"
  | "nameRequired"
  | "nameMinLength"
  | "fullNameRequired";

/** Keys of the `PasswordStrength` namespace. */
export type PasswordRequirementKey = "minLength" | "lowercase" | "uppercase" | "number" | "symbol";

export interface PasswordRule {
  /** Error key in the `Validation` namespace. */
  validationKey: ValidationKey;
  /** Label key in the `PasswordStrength` namespace. */
  labelKey: PasswordRequirementKey;
  test: (password: string) => boolean;
}

/**
 * The single source of truth for the password policy. Used by the strength
 * meter, the registration form and the server actions.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    validationKey: "passwordMinLength",
    labelKey: "minLength",
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    validationKey: "lowercaseRequired",
    labelKey: "lowercase",
    test: (value) => /[a-z]/.test(value),
  },
  {
    validationKey: "uppercaseRequired",
    labelKey: "uppercase",
    test: (value) => /[A-Z]/.test(value),
  },
  { validationKey: "numberRequired", labelKey: "number", test: (value) => /\d/.test(value) },
  {
    validationKey: "symbolRequired",
    labelKey: "symbol",
    test: (value) => /[^a-zA-Z0-9]/.test(value),
  },
];

export function validateEmail(value: string): ValidationKey | null {
  const email = value.trim();
  if (email.length === 0) return "emailRequired";
  if (!EMAIL_PATTERN.test(email)) return "emailInvalid";
  return null;
}

export function validatePassword(value: string): ValidationKey | null {
  if (value.length === 0) return "passwordRequired";
  const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
  return failed?.validationKey ?? null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): ValidationKey | null {
  if (confirmation.length === 0) return "confirmPasswordRequired";
  if (confirmation !== password) return "passwordsMismatch";
  return null;
}

export function validateName(value: string): ValidationKey | null {
  const name = value.trim();
  if (name.length === 0) return "nameRequired";
  if (name.length < NAME_MIN_LENGTH) return "nameMinLength";
  if (!FULL_NAME_PATTERN.test(name)) return "fullNameRequired";
  return null;
}

/** Title-cases every word of a person's name. */
export function normalizeName(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Requirements of the password policy that are currently met. */
export function metPasswordRequirements(value: string): number {
  return PASSWORD_RULES.filter((rule) => rule.test(value)).length;
}
