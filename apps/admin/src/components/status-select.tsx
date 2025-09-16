"use client";

import {
  ArchiveX,
  CheckCircle,
  CircleDotDashed,
  FilePenLine,
  PackageX,
  PauseCircle,
} from "lucide-react";

import * as React from "react";

import { ProductStatusEnum } from "@workspace/api-client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const statusConfig: Record<
  ProductStatusEnum,
  {
    label: string;
    icon?: React.JSX.Element;
  }
> = {
  active: {
    label: "Active",
    icon: (
      <CheckCircle className="fill-green-500 dark:fill-green-400 text-background" />
    ),
  },
  discontinued: {
    label: "Discontinued",
    icon: (
      <ArchiveX className="fill-red-500 dark:fill-red-400 text-background" />
    ),
  },
  draft: {
    label: "Draft",
    icon: (
      <FilePenLine className="fill-blue-500 dark:fill-blue-400 text-background" />
    ),
  },
  inactive: {
    label: "Inactive",
    icon: (
      <PauseCircle className="fill-gray-400 dark:fill-gray-500 text-background" />
    ),
  },
  out_of_stock: {
    label: "Out of stock",
    icon: (
      <PackageX className="fill-yellow-500 dark:fill-yellow-400 text-background" />
    ),
  },
};

export const statusOptions = Object.values(ProductStatusEnum).map((value) => ({
  label: statusConfig[value].label,
  value,
  icon: statusConfig[value].icon ?? <CircleDotDashed />,
}));

export function StatusSelect({
  status,
  onStatusChange,
}: {
  status?: ProductStatusEnum;
  onStatusChange?: (status: ProductStatusEnum) => void;
}) {
  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.icon}
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
