import type * as React from "react";
import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TextInputProps extends Omit<React.ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  /** Already translated validation message. */
  error?: string;
  /** Right-aligned element next to the label. */
  action?: React.ReactNode;
  /** Control rendered inside the input, e.g. a show-password toggle. */
  endAdornment?: React.ReactNode;
  containerClassName?: string;
}

/** Labeled text input with error state, used across the application. */
export function TextInput({
  id,
  label,
  error,
  action,
  endAdornment,
  containerClassName,
  className,
  ...inputProps
}: TextInputProps) {
  const input = (
    <Input
      id={id}
      aria-invalid={error ? true : undefined}
      className={cn(endAdornment ? "pr-9" : undefined, className)}
      {...inputProps}
    />
  );

  return (
    <FormField id={id} label={label} error={error} action={action} className={containerClassName}>
      {endAdornment ? (
        <div className="relative">
          {input}
          <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div>
        </div>
      ) : (
        input
      )}
    </FormField>
  );
}
