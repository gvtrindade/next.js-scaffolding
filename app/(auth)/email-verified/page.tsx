import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("EmailVerified");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    openGraph: { title: t("metaTitle"), description: t("metaDescription") },
  };
}

export default async function EmailVerifiedPage() {
  const t = await getTranslations("EmailVerified");

  return (
    <Card>
      <PageHeader title={t("title")} description={t("description")} />
      <CardContent>
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="size-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button render={<Link href="/protected" />}>{t("goToProtected")}</Button>
      </CardFooter>
    </Card>
  );
}
