import { Column, ColumnDef } from "@tanstack/react-table"
import { capitalize } from "./utils"
import { FilterParsers, FilterVariant } from "../types/data-table"
import { dataTableConfig } from "../config/data-table"

export function getColumnLabel<TData>(column: Column<TData>) {
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header
  }
  return capitalize(column.id.replaceAll("_", " "))
}

export type ColumnId<K> = K extends { id: string }
  ? K["id"]
  : K extends { accessorKey: string }
    ? K["accessorKey"]
    : never

export function getColumnId<TData>(column: ColumnDef<TData>) {
  if ("id" in column && column.id) return column.id
  if ("accessorKey" in column) return String(column.accessorKey)
  return undefined
}

export type ColumnFilterParsers<C extends ColumnDef<any>[]> = {
  [K in C[number] as K extends { meta: { variant: string } }
    ? ColumnId<K>
    : never]: K["meta"] extends { variant: FilterVariant }
    ? FilterParsers[K["meta"]["variant"]]
    : never
} & {}

export function getColumnFilterParsers<C extends ColumnDef<any>[]>(columns: C) {
  return Object.fromEntries(
    columns.flatMap((column) => {
      const id = getColumnId(column)
      if (!id) return []
      const variant = column.meta?.variant
      if (!variant || !(variant in dataTableConfig.filterParsers)) return []
      return [[id, dataTableConfig.filterParsers[variant]]]
    })
  ) as ColumnFilterParsers<C>
}
