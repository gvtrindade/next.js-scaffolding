import type * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Id of the control rendered as `children`; used for the label association. */
  id: string;
  label: string;
  /** Already translated validation message. */
  error?: string;
  /** Right-aligned element next to the label, e.g. a "Forgot password?" link. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + control + error message. Generic so it can wrap any shadcn control
 * (input, select, textarea…), not just text inputs.
 */
export function FormField({ id, label, error, action, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {action ? (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
          {action}
        </div>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
