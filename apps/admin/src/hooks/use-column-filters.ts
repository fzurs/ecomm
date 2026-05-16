import { nullsToUndefined, NullToUndefined } from "@/lib/utils"
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/react-table"
import {
  useQueryStates,
  UseQueryStatesKeysMap,
  SingleParser,
  Values,
} from "nuqs"
import React from "react"
import { useDebouncedCallback } from "./use-debounced-callback"

type HasFilterParser<K> = K extends {
  id: string
  meta: { filter: { parser: SingleParser<any> } }
}
  ? true
  : false

type ExtractColumnFilterParsers<T, C extends readonly ColumnDef<T>[]> = {
  [K in C[number] as HasFilterParser<K> extends true
    ? K["id"] & string
    : never]: K["meta"] extends {
    filter: { parser: infer P extends SingleParser<any> }
  }
    ? P
    : never
}

function extractColumnFilterParsers<
  TData,
  const C extends readonly ColumnDef<TData>[],
>(columns: C): ExtractColumnFilterParsers<TData, C>
function extractColumnFilterParsers<TData>(
  columns: ColumnDef<TData>[]
): Record<string, SingleParser<any>>
function extractColumnFilterParsers<TData>(
  columns: readonly ColumnDef<TData>[] | ColumnDef<TData>[]
) {
  return Object.fromEntries(
    (columns as ColumnDef<TData>[])
      .filter(
        (
          col
        ): col is ColumnDef<TData> & {
          id: string
          meta: { filter: { parser: SingleParser<any> } }
        } => !!col.id && !!col.meta?.filter?.parser
      )
      .map((c) => [c.id, c.meta.filter.parser])
  )
}

export function useColumnFilterValues<
  T extends readonly ColumnDef<any>[] | ColumnDef<any>[],
>(
  columns: T
): T extends readonly ColumnDef<infer TData>[]
  ? NullToUndefined<Values<ExtractColumnFilterParsers<TData, T>>>
  : NullToUndefined<Values<any>> {
  return nullsToUndefined(
    useQueryStates(extractColumnFilterParsers(columns as any))[0]
  ) as any
}

export function useColumnFilters<TData>(columns: ColumnDef<TData>[]) {
  const filterKeyMap = extractColumnFilterParsers(columns)
  const [filterState, setFilterState] = useQueryStates(filterKeyMap)
  const debouncedSetFilterState = useDebouncedCallback(
    (values: typeof filterState) => setFilterState(values),
    300
  )

  const initialColumnFilters = React.useMemo<ColumnFiltersState>(
    () =>
      Object.entries(filterState)
        .filter(
          ([key, value]) =>
            value !== null &&
            value !== (filterKeyMap[key] as { defaultValue?: any }).defaultValue
        )
        .map(([key, value]) => ({
          id: key,
          value,
        })),
    [filterState]
  )

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)

  const onColumnFiltersChange = React.useCallback<
    OnChangeFn<ColumnFiltersState>
  >(
    (updaterOrValue) => {
      setColumnFilters((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue

        const nextState: UseQueryStatesKeysMap = Object.fromEntries(
          Object.entries(filterKeyMap).map(([key, parser]) => {
            const value = next.find((f) => f.id === key)?.value
            if (!value)
              return [
                key,
                (parser as { defaultValue?: any })?.defaultValue ?? null,
              ]
            return [key, value]
          })
        )

        debouncedSetFilterState(nextState)

        return next
      })
    },
    [columnFilters, debouncedSetFilterState]
  )

  return { columnFilters, onColumnFiltersChange }
}
