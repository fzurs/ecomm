"use client";

import * as React from "react";

import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Languages } from "lucide-react";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export function NavLocale() {
  const t = useTranslations("components.navLocale");
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <Languages className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{t("label")}</span>
                <span className="truncate text-xs">
                  {t(`languages.${currentLanguage}`)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right">
            <DropdownMenuLabel className="text-muted-foreground text-xs">{t("label")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={value} onValueChange={handleChange}>
              {routing.locales.map((lang) => (
                <DropdownMenuRadioItem key={lang} value={lang}>
                  {t(`languages.${lang}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
