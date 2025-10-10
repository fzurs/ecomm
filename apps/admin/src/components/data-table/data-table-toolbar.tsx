import { RowData, Table } from "@tanstack/react-table";

export function DataTableToolbar<TData extends RowData>({
  table,
}: {
  table: Table<TData>;
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter());

  return <div>{columns.map((column) => column.id)}</div>;
}
