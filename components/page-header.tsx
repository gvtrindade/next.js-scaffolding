import type * as React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Title block used by every page/card header: one title, optional description,
 * centered by default. Text is always passed in already translated.
 */
export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <CardHeader className={cn("text-center", className)}>
      <CardTitle className="text-xl">{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
      {children}
    </CardHeader>
  );
}
