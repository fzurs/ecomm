"use client";

import { Column, Table } from "@tanstack/react-table";
import { SearchIcon, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

export function DataTableToolbar<TData>({
  table,
  children,
}: {
  table: Table<TData>;
  children?: React.ReactNode;
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2 lg:gap-4">
        {columns.map((column) => (
          <DataTableToolbarFilter
            key={column.id}
            column={column}
            table={table}
          />
        ))}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        {children}
      </div>
    </div>
  );
}

function DataTableToolbarFilter<TData, TValue>({
  column,
  table,
}: {
  column: Column<TData, TValue>;
  table: Table<TData>;
}) {
  const columnMeta = column.columnDef.meta;

  switch (columnMeta?.variant) {
    case "globalFilter":
      const [value, setValue] = React.useState("");
      const columnFilterValue = (table.getState().globalFilter as string) ?? "";
      const debouncedSetGlobalFilter = useDebouncedCallback(
        table.setGlobalFilter,
        300,
      );

      React.useEffect(() => {
        setValue(columnFilterValue);
      }, [columnFilterValue]);

      return (
        <InputGroup className="max-w-96">
          <InputGroupInput
            placeholder={columnMeta.placeholder || columnMeta.label}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              debouncedSetGlobalFilter(event.target.value);
            }}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon
            align="inline-end"
            hidden={!table.getState().globalFilter}
          >
            {table.getRowModel().rows.length} results
          </InputGroupAddon>
        </InputGroup>
      );
    case "text":
      return (
        <Input
          className="max-w-96"
          placeholder={columnMeta.placeholder || columnMeta.label}
          value={(column.getFilterValue() as string) ?? ""}
          onChange={(event) => column.setFilterValue(event.target.value)}
        />
      );
    case "select":
      return (
        <DataTableFacetedFilter
          column={column}
          options={columnMeta.options || []}
          title={columnMeta.label ?? column.id}
          placeholder={columnMeta.placeholder}
        />
      );
    default:
      return null;
  }
}
