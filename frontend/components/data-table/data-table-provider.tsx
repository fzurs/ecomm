"use client";

import { RowData, Table } from "@tanstack/react-table";
import { createContext, useContext } from "react";

export const DataTableContext = createContext<Table<unknown> | null>(null);

export function DataTableProvider<TData>({
  children,
  table,
}: {
  children?: React.ReactNode;
  table: Table<TData>;
}) {
  return (
    <DataTableContext.Provider value={table as Table<unknown>}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTable<TData extends RowData>() {
  const table = useContext(DataTableContext);

  if (!table) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }

  return table as Table<TData>;
}
