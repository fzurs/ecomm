"use client";

import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

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
      size="sm"
      variant="ghost"
      onClick={() => {
        column.toggleSorting(undefined);
      }}
      className={cn(
        "py-0 px-0 h-7 m-0 hover:bg-transparent dark:hover:bg-transparent flex gap-2 items-center justify-between w-full",
        className
      )}
    >
      <span>{title}</span>
      <div className="flex flex-col">
        <IconChevronUp
          className={cn(
            "-mb-0.5 size-3",
            column.getIsSorted() === "asc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
        <IconChevronDown
          className={cn(
            "-mt-0.5 size-3",
            column.getIsSorted() === "desc"
              ? "text-accent-foreground"
              : "text-muted-foreground"
          )}
        />
      </div>
    </Button>
  );
}
