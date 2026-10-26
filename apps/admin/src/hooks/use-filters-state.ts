import { parseAsIndex, useQueryStates } from "nuqs"
import { Dispatch, SetStateAction, useCallback, useMemo } from "react"
import { FiltersState, parseAsFilters } from "@workspace/data-table/filters"

/**
 * The table filters (`DataTableFilter`), kept in the `filters` URL param.
 * Changing them goes back to the first page, like `useSearch`. Filters of
 * columns not in `columns` (an old link) are dropped: `DataTableFilter` throws
 * on an unknown column.
 */
export function useFiltersState(columns: ReadonlyArray<{ id: string }>) {
  const [{ filters }, setQueryStates] = useQueryStates({
    filters: parseAsFilters.withDefault([]),
    page: parseAsIndex.withDefault(0),
  })

  const knownFilters = useCallback(
    (filters: FiltersState) =>
      filters.filter((filter) =>
        columns.some((column) => column.id === filter.columnId)
      ),
    [columns]
  )

  const setFilters = useCallback<Dispatch<SetStateAction<FiltersState>>>(
    (value) =>
      setQueryStates((prev) => ({
        filters:
          typeof value === "function"
            ? value(knownFilters(prev.filters))
            : value,
        page: null,
      })),
    [setQueryStates, knownFilters]
  )

  return [
    useMemo(() => knownFilters(filters), [knownFilters, filters]),
    setFilters,
  ] as const
}
