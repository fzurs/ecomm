import {
  ArchiveX,
  CircleCheck,
  FilePenLine,
  LucideIcon,
  PackageX,
  PauseCircle,
} from "lucide-react";

import { ProductStatusEnum } from "@workspace/api-client";

export const statusEnum: Record<
  ProductStatusEnum,
  { icon?: LucideIcon; label: string; iconClassName?: string }
> = {
  active: {
    label: "Active",
    icon: CircleCheck,
    iconClassName: "fill-green-500 dark:fill-green-400 text-background",
  },
  discontinued: {
    label: "Discontinued",
    icon: ArchiveX,
    iconClassName: "fill-red-500 dark:fill-red-400 text-background",
  },
  draft: {
    label: "Draft",
    icon: FilePenLine,
    iconClassName: "fill-blue-500 dark:fill-blue-400 text-background",
  },
  inactive: {
    label: "Inactive",
    icon: PauseCircle,
    iconClassName: "fill-gray-400 dark:fill-gray-500 text-background",
  },
  out_of_stock: {
    label: "Out of stock",
    icon: PackageX,
    iconClassName: "fill-yellow-500 dark:fill-yellow-400 text-background",
  },
};

export const statuses: {
  label: string;
  value: ProductStatusEnum;
  icon?: LucideIcon;
  iconClassName?: string;
}[] = Object.keys(statusEnum).map((key) => {
  const status = statusEnum[key as keyof typeof statusEnum];
  return {
    label: status.label,
    value: key as ProductStatusEnum,
    icon: status.icon,
    iconClassName: status.iconClassName,
  };
});

export const statusList = Object.keys(statusEnum) as Array<
  keyof typeof statusEnum
>;

export const defaultPageSize = 100;
