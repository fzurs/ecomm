"use client";

import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

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
      {column.getIsSorted() === "asc" ? (
        <ArrowUp />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown />
      ) : (
        <ArrowUpDown />
      )}
    </Button>
  );
}
