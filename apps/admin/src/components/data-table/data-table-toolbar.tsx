"use client";

import * as React from "react";
import { Column, Table } from "@tanstack/table-core";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Input } from "../ui/input";

export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());

  return (
    <div>
      {columns.map((column) => (
        <DataTableToolbarFilter key={column.id} column={column} />
      ))}
    </div>
  );
}

function DataTableToolbarFilter<TData>({ column }: { column: Column<TData> }) {
  const columnMeta = column.columnDef.meta;

  const onFilterRender = React.useCallback(() => {
    if (!columnMeta) return null;

    switch (columnMeta.variant) {
      case "text":
        return (
          <Input
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="h-8 w-40 lg:w-56"
          />
        );
      case "select":
        return (
          <DataTableFacetedFilter
            column={column}
            options={columnMeta.options ?? []}
            title={columnMeta.label ?? column.id}
          />
        );
      default:
        return null;
    }
  }, [columnMeta]);

  return onFilterRender();
}
