import { ColumnDef } from "@tanstack/react-table"

export type ColumnId<K> = K extends { id: string }
  ? K["id"]
  : K extends { accessorKey: string }
    ? K["accessorKey"]
    : never

export function getColumnId<TData, TValue>(
  column: ColumnDef<TData, TValue>
): string | undefined {
  if ("id" in column && column.id) {
    return column.id
  }

  if ("accessorKey" in column) {
    return String(column.accessorKey)
  }

  return undefined
}
