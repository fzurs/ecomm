import { parseAsIndex, useQueryStates } from "nuqs"
import { Dispatch, SetStateAction, useCallback } from "react"
import { FiltersState, parseAsFilters } from "@workspace/data-table/filters"

/**
 * The table filters (`DataTableFilter`), kept in the `filters` URL param.
 * Changing them goes back to the first page, like `useSearch`.
 */
export function useFiltersState() {
  const [{ filters }, setQueryStates] = useQueryStates({
    filters: parseAsFilters.withDefault([]),
    page: parseAsIndex.withDefault(0),
  })

  const setFilters = useCallback<Dispatch<SetStateAction<FiltersState>>>(
    (value) =>
      setQueryStates((prev) => ({
        filters: typeof value === "function" ? value(prev.filters) : value,
        page: null,
      })),
    [setQueryStates]
  )

  return [filters, setFilters] as const
}
