"use client";

import * as React from "react";

import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function LocaleSelector() {
  const t = useTranslations("components.localeSelector");
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  const [value, setValue] = React.useState<string>();

  const currentLanguage =
    routing.locales.find((lang) => lang === locale) || routing.defaultLocale;

  React.useEffect(() => {
    setValue(currentLanguage);
  }, [setValue, currentLanguage]);

  const handleChange = React.useCallback(
    (value: string) => {
      setValue(value);
      router.replace(fullPath, { locale: value });
    },
    [setValue, router, fullPath]
  );

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground text-xs">
            {t("label")}
          </SelectLabel>
          {routing.locales.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {t(`languages.${lang}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
