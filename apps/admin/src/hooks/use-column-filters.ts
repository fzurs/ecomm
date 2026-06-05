import { nullsToUndefined } from "@/lib/utils"
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

type FilterParsers<C extends ColumnDef<any>[]> = ColumnDef<any>[] extends C
  ? { [id: string]: SingleParser<any> }
  : {
      [K in C[number] as HasFilterParser<K> extends true
        ? K["id"] & string
        : never]: K["meta"] extends {
        filter: { parser: infer P extends SingleParser<any> }
      }
        ? P
        : never
    }

function buildFilterParsers<C extends ColumnDef<any>[]>(
  columns: C
): FilterParsers<C> {
  return Object.fromEntries(
    columns
      .filter((column) => !!column.id && !!column.meta?.filter?.parser)
      .map((column) => [column.id, column.meta?.filter?.parser])
  )
}

export function useColumnFilterValues<C extends ColumnDef<any>[]>(columns: C) {
  const filterParsers = React.useMemo(
    () => buildFilterParsers(columns),
    [columns]
  )

  const [values] = useQueryStates(filterParsers)

  const normalizedValues = React.useMemo(
    () => nullsToUndefined(values),
    [values]
  )

  return normalizedValues
}

export function useColumnFilters(columns: ColumnDef<any>[]) {
  const parsers = React.useMemo(() => buildFilterParsers(columns), [columns])

  const [values, setValues] = useQueryStates(parsers)

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () =>
      Object.entries(values)
        .filter(([, value]) => value !== null)
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
          Object.keys(parsers).map((id) => [
            id,
            next.find((f) => f.id === id)?.value ?? null,
          ])
        )
      )
    },
    [columnFilters, setValues, parsers]
  )

  return { columnFilters, onColumnFiltersChange }
}
