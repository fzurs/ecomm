import { nullsToUndefined } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/react-table"
import { SingleParser, useQueryStates } from "nuqs"
import React from "react"

type ExtractParsers<T, C extends readonly ColumnDef<T>[]> = {
  [K in C[number] as K extends {
    id: string
    meta: { filter: { parser: SingleParser<any> } }
  }
    ? K["id"]
    : never]: K["meta"] extends {
    filter: { parser: infer P extends SingleParser<any> }
  }
    ? P
    : never
}

export function extractParsers<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(
  columns:
    | C
    // Se le agrega este tipado para evitar el error accessorFn
    | ColumnDef<TData>[]
): ExtractParsers<TData, C> {
  let filterParsers = {}
  columns.forEach((column) => {
    if (column.id && column.meta?.filter) {
      ;(filterParsers as any)[column.id] = column.meta.filter.parser
    }
  })
  return filterParsers as ExtractParsers<TData, C>
}

export function useColumnFilterValues<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(columns: C | ColumnDef<TData>[]) {
  return nullsToUndefined(useQueryStates(extractParsers<TData, C>(columns))[0])
}

export function useColumnFilters<TData>(columns: ColumnDef<TData>[]) {
  const filterParsers = extractParsers(columns as any)
  const [filterState, setFilterState] = useQueryStates(filterParsers)

  // definicion de los filtros
  const columnFilters = Object.entries(filterState)
    .filter(([, value]) => {
      if (value === null || value === undefined) return false
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === "string") return value.length > 0
      return true
    })
    .map(([id, value]) => ({ id, value }))

  React.useEffect(() => {
    console.log(filterState, columnFilters)
  }, [filterState, columnFilters])

  const onColumnFiltersChange = React.useCallback<
    OnChangeFn<ColumnFiltersState>
  >(
    (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue
      // Creamos el objeto
      const nextState = Object.fromEntries(
        Object.keys(next).map((key) => [key, null])
      )

      // y le pasamos el value parseado
      next.forEach(({ id, value }) => {
        nextState[id] = filterParsers[id]?.parse(String(value))
      })
      // solucion al valor fantasma del filtro
      for (const prevColumnFilter of columnFilters) {
        if (!next.some((f) => f.id === prevColumnFilter.id)) {
          nextState[prevColumnFilter.id] = null
        }
      }
      // actualizamos el estado
      setFilterState(nextState)
    },
    [columnFilters, filterParsers, setFilterState]
  )

  return { columnFilters, onColumnFiltersChange }
}
