import { SiteHeader } from "@/components/site-header";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleSelector } from "@/components/locale-selector";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("SettingsPage");

  return (
    <>
      <SiteHeader title={t("title")} />
      <div className="flex flex-col w-full p-10">
        <div className="flex flex-col max-w-4xl mx-auto w-full">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {t("title")}
          </h2>
          <div className="flex flex-col gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.theme.title")}</CardTitle>
                <CardDescription>
                  {t("sections.theme.description")}
                </CardDescription>
                <CardAction>
                  <ModeToggle />
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.language.title")}</CardTitle>
                <CardDescription>
                  {t("sections.language.description")}
                </CardDescription>
                <CardAction>
                  <LocaleSelector />
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
