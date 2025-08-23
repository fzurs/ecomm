"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTranslations } from "next-intl";

export function ModeToggle() {
  const t = useTranslations("components.modeToggle");
  const { theme, themes, setTheme } = useTheme();
  const [value, setValue] = React.useState<typeof theme>();

  React.useEffect(() => {
    setValue(theme);
  }, [theme, setValue]);

  const handleChange = (value: string) => {
    setValue(value);
    setTheme(value);
  };

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
          {themes.map((th) => (
            <SelectItem key={th} value={th}>
              {t(`themes.${th}`)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
