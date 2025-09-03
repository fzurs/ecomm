"use client";

import { Table } from "@tanstack/react-table";
import { VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as ReactDOM from "react-dom";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function DataTableActionBar<TData>({
  children,
  table,
}: {
  children?: React.ReactNode;
  table: Table<TData>;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [table]);

  const visible = table.getFilteredSelectedRowModel().rows.length > 0;

  const container = mounted ? globalThis.document.body : null;

  if (!container) return null;

  return ReactDOM.createPortal(
    <div
      role="toolbar"
      className={cn(
        "fixed inset-x-0 bottom-6 z-50 mx-auto",
        "flex w-fit p-2 items-center",
        "bg-background border border-border shadow-sm rounded-lg",
        visible ? "flex" : "hidden",
      )}
    >
      {children}
    </div>,
    container,
  );
}

export function DataTableActionBarSelection<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <Button variant={null} size="sm" className="text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} selected
    </Button>
  );
}

export function DataTableActionBarAction({
  tooltip,
  variant = "ghost",
  size = "sm",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { tooltip?: string }) {
  const trigger = (
    <Button
      variant={variant === "destructive" ? null : variant}
      size={size}
      className={cn(
        variant === "destructive" && "text-destructive hover:bg-destructive/20",
        className,
      )}
      {...props}
    />
  );

  if (!tooltip) return trigger;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function DataTableActionBarClose<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  const onClearSelection = React.useCallback(() => {
    table.toggleAllRowsSelected(false);
  }, [table]);

  return (
    <DataTableActionBarAction onClick={onClearSelection}>
      <X />
    </DataTableActionBarAction>
  );
}

export function DataTableActionBarSeparator({
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      orientation={orientation}
      className={cn(
        "hidden data-[orientation=vertical]:h-5 sm:block mx-2",
        className,
      )}
      {...props}
    />
  );
}
