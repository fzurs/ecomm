import { CircleCheck, CircleMinus, LucideIcon } from "lucide-react";

import { StatusEnum } from "@workspace/typescript-axios-client";

export const statusesValueLabel: Record<
  StatusEnum,
  { icon?: LucideIcon; label: string }
> = {
  active: { label: "Active", icon: CircleCheck },
  discontinued: { label: "Discontinued" },
  draft: { label: "Draft" },
  inactive: { label: "Inactive", icon: CircleMinus },
  out_of_stock: { label: "Out of stock" },
};

export const statuses: {
  label: string;
  value: StatusEnum;
  icon?: LucideIcon;
}[] = Object.keys(statusesValueLabel).map((key) => ({
  label: statusesValueLabel[key as keyof typeof statusesValueLabel].label,
  value: key as StatusEnum,
  icon: statusesValueLabel[key as keyof typeof statusesValueLabel].icon,
}));
