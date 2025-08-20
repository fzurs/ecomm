"use client";

import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

export function DataTableColumnHeader<TData, TValue>({
  title,
  column,
  className,
}: {
  title: string;
  column: Column<TData, TValue>;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      onClick={column.getToggleSortingHandler()}
      className={cn(className)}
    >
      {title}
      <ArrowUpDown />
    </Button>
  );
}
