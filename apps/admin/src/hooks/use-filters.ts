import { useQueryStates, UseQueryStatesKeysMap } from "nuqs"
import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  ColumnFilterParsers,
  getColumnFilterParsers,
} from "@workspace/data-table/lib/column"

type NormalizeFilters<T> = {
  [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K]
} & {}

function normalizeFilters<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [key, value ?? undefined])
  ) as NormalizeFilters<T>
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
type Merge<A, B> = Simplify<Omit<A, keyof B> & B>

export function useFilters<
  C extends ColumnDef<any>[],
  T extends UseQueryStatesKeysMap,
>(columns: C, filterParsers: T = {} as T) {
  const columnFilterParsers = useMemo(
    () => getColumnFilterParsers(columns),
    [columns]
  )

  const parsers = useMemo(
    () =>
      ({ ...columnFilterParsers, ...filterParsers }) as Merge<
        ColumnFilterParsers<C>,
        T
      >,
    [columnFilterParsers, filterParsers]
  )

  const [filters] = useQueryStates(parsers)

  return useMemo(() => normalizeFilters(filters), [filters])
}
