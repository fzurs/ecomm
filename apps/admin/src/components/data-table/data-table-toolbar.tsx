"use client";

import type { Column, Table } from "@tanstack/react-table";
import { LucideIcon, SearchIcon, TextIcon, X } from "lucide-react";
import * as React from "react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/utils";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export function DataTableToolbar<TData>({
  table,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  table: Table<TData>;
}) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter
            key={column.id}
            column={column}
            table={table}
          />
        ))}
        {isFiltered && (
          <Button variant="ghost" onClick={onReset}>
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

function DataTableToolbarFilter<TData>({
  column,
  table,
}: {
  column: Column<TData>;
  table: Table<TData>;
}) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case "search":
          return (
            <DataTableTextFilter
              icon={SearchIcon}
              column={column}
              placeholder={columnMeta.placeholder ?? columnMeta.label}
            />
          );

        case "text":
          return (
            <DataTableTextFilter
              column={column}
              placeholder={columnMeta.placeholder ?? columnMeta.label}
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}

function DataTableTextFilter<TData>({
  column,
  placeholder,
  icon: TextIconProp = TextIcon,
}: {
  column: Column<TData>;
  placeholder?: string;
  icon?: LucideIcon;
}) {
  const filterValue = (column.getFilterValue() as string) ?? "";
  const [textValue, setTextValue] = React.useState(filterValue);
  // actualizamos el estado cuando se aplique un cambio
  // en el valor por fuera de este componente
  React.useEffect(() => {
    setTextValue(filterValue);
  }, [filterValue]);

  const debouncedSetFilterChange = useDebouncedCallback(
    (value: string) => column.setFilterValue(value),
    300,
  );
  const onTextChange = React.useCallback(
    (value: string) => {
      setTextValue(value);
      debouncedSetFilterChange(value);
    },
    [setTextValue, debouncedSetFilterChange],
  );

  return (
    <InputGroup className="max-w-72">
      <InputGroupInput
        placeholder={placeholder}
        value={textValue}
        onChange={(event) => onTextChange(event.target.value)}
      />
      <InputGroupAddon>
        <TextIconProp />
      </InputGroupAddon>
    </InputGroup>
  );
}
