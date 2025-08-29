"use client";

import * as React from "react";
import { Column, Table } from "@tanstack/table-core";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

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
        return <div>TExt</div>;
      case "select":
        return (
          <DataTableFacetedFilter
            column={column}
            options={columnMeta.options ?? []}
          />
        );
      default:
        return null;
    }
  }, [columnMeta]);

  return onFilterRender();
}
