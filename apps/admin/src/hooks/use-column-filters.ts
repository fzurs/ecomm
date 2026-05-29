import { nullsToUndefined, toNullIfEmpty } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/react-table"
import { SingleParser, useQueryStates, Values } from "nuqs"
import * as React from "react"

type HasFilterParser<K> = K extends {
  id: string
  meta: { filter: { parser: SingleParser<any> } }
}
  ? true
  : false

type ExtractFilterParsers<C extends ColumnDef<any>[]> = {
  [K in C[number] as HasFilterParser<K> extends true
    ? K["id"] & string
    : never]: K["meta"] extends {
    filter: { parser: infer P extends SingleParser<any> }
  }
    ? P
    : never
} & {}

function extractFilterParsers<C extends ColumnDef<any>[]>(
  columns: C
): ExtractFilterParsers<C> {
  return Object.fromEntries(
    columns
      .filter((column) => !!column.id && !!column.meta?.filter?.parser)
      .map((column) => [column.id, column.meta?.filter?.parser])
  )
}

export function useColumnFilterValues<C extends ColumnDef<any>[]>(columns: C) {
  const keyMap = React.useMemo(() => extractFilterParsers(columns), [columns])
  const [values] = useQueryStates(keyMap)
  return React.useMemo(() => nullsToUndefined(values), [values])
}

export function useColumnFilters<TData>(columns: ColumnDef<TData>[]) {
  const keyMap = React.useMemo(() => extractFilterParsers(columns), [columns])
  const [values, setValues] = useQueryStates(keyMap)

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () =>
      Object.entries(values)
        .filter(([, value]) => toNullIfEmpty(value) !== null)
        .map(([id, value]) => ({
          id,
          value,
        })),
    [values]
  )

  const onColumnFiltersChange = React.useCallback<
    OnChangeFn<ColumnFiltersState>
  >(
    (value) => {
      const next = typeof value === "function" ? value(columnFilters) : value

      setValues(
        Object.fromEntries(
          Object.keys(keyMap).map((key) => [
            key,
            toNullIfEmpty(next.find((f) => f.id === key)?.value),
          ])
        )
      )
    },
    [columnFilters, setValues, keyMap]
  )

  return { columnFilters, onColumnFiltersChange }
}
