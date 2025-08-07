"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

export function DataTableFilterInput<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <Input
      placeholder="Buscar productos..."
      value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn("title")?.setFilterValue(event.target.value)
      }
      className="max-w-[300px] rounded-sm"
    />
  );
}
