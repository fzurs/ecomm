import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="container p-4 lg:py-6 mx-auto flex justify-center items-center">
      <h1>{t("title")}</h1>
      <Link href="/" locale="es">
        Switch to Spanish
      </Link>
      <Link href="/" locale="en">
        Cambiar a ingles
      </Link>
      <Link href="/admin">Admin</Link>
    </div>
  );
}
