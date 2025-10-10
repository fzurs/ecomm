import {
  ArchiveX,
  CheckCircle,
  FilePenLine,
  LucideIcon,
  PackageX,
  PauseCircle,
} from "lucide-react";

import { ProductStatusEnum } from "@workspace/api-client";

export const productStatusConfig: Record<
  ProductStatusEnum,
  {
    label: string;
    icon?: LucideIcon;
    iconClassName?: string;
  }
> = {
  active: {
    label: "Active",
    icon: CheckCircle,
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

export const productStatusOptions = Object.values(ProductStatusEnum).map(
  (value) => ({ value, ...productStatusConfig[value] }),
);
