import { SiteHeader } from "@/components/site-header";
import { getTranslations } from "next-intl/server";

export default async function AdminPage() {
  const t = await getTranslations("AdminPage");

  return (
    <>
      <SiteHeader title="Admin" />
      <div className="flex flex-col w-full max-w-3xl p-4 md:p-6 mx-auto">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {t("title")}
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </>
  );
}
