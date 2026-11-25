import { PageHeader } from "@/components/page-header";
import LogoutButton from "@/components/logout-button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/services/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function Protected() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const t = await getTranslations("Protected");

  return (
    <Card>
      <PageHeader title={t("title")} />
      <CardContent>
        <LogoutButton />
      </CardContent>
    </Card>
  );
}
