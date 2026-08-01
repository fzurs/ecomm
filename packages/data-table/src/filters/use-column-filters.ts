import {
  ColumnDef,
  ColumnFiltersState,
  functionalUpdate,
  OnChangeFn,
} from "@tanstack/react-table"
import { useQueryStates, UseQueryStatesKeysMap } from "nuqs"
import { useCallback, useMemo } from "react"
import { buildFilterParsers } from "./build-filter-parsers"

export function useDataTableColumnFilters(
  columns: ColumnDef<any>[],
  filterParsers: UseQueryStatesKeysMap = {}
) {
  const [values, setValues] = useQueryStates({
    ...buildFilterParsers(columns),
    ...filterParsers,
  })

  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      Object.entries(values).flatMap(([id, value]) =>
        value !== null ? [{ id, value }] : []
      ),
    [values]
  )

  const onColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const next = functionalUpdate(updater, columnFilters)

      console.log(updater)

      setValues(
        Object.keys(values).reduce<Record<string, unknown>>((acc, id) => {
          const filter = next.find((f) => f.id === id)
          acc[id] = filter?.value ?? null
          return acc
        }, {})
      )
    },
    [columnFilters, values, setValues]
  )

  return { columnFilters, onColumnFiltersChange }
}
