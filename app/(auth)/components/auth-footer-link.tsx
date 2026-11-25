import Link from "next/link";
import { CardFooter } from "@/components/ui/card";

interface AuthFooterLinkProps {
  /** Already translated sentence leading to the link. */
  prompt?: string;
  /** Already translated link label. */
  linkLabel: string;
  href: string;
}

/** Footer of an auth card: "Don't have an account? Sign up". */
export function AuthFooterLink({ prompt, linkLabel, href }: AuthFooterLinkProps) {
  return (
    <CardFooter className="justify-center">
      <p className="text-sm text-muted-foreground">
        {prompt ? `${prompt} ` : null}
        <Link href={href} className="text-foreground underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      </p>
    </CardFooter>
  );
}
