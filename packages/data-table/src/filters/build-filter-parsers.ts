import { ColumnDef } from "@tanstack/react-table"
import { ColumnId, getColumnId } from "./get-column-id"
import { defaultParsers, FilterVariant } from "../core/default-parsers"

export type FilterParsers<C extends ColumnDef<any>[]> = {
  [K in C[number] as K extends { meta: { variant: string } }
    ? ColumnId<K>
    : never]: K["meta"] extends { variant: FilterVariant }
    ? (typeof defaultParsers)[K["meta"]["variant"]]
    : never
} & {}

export function buildFilterParsers<C extends ColumnDef<any>[]>(
  columns: C
): FilterParsers<C> {
  return Object.fromEntries(
    columns.flatMap((column) => {
      const id = getColumnId(column)
      if (!id) return []
      const variant = column.meta?.variant
      if (!variant || !(variant in defaultParsers)) return []
      return [[id, defaultParsers[variant]]]
    })
  ) as FilterParsers<C>
}
