import { ColumnSort, OnChangeFn, SortingState } from "@tanstack/react-table"
import { createParser, useQueryState } from "nuqs"
import * as React from "react"
import { useCallback } from "react"

const COLUMN_SORT_KEY = "sort"

const parseAsColumnSort = createParser<ColumnSort>({
  parse: (value) => {
    const [id, direction] = value.split(".")
    if (!id || (direction !== "asc" && direction !== "desc")) {
      return null
    }
    return { id, desc: direction === "desc" }
  },
  serialize: ({ id, desc }) => {
    return `${id}.${desc ? "desc" : "asc"}`
  },
})

function useColumnSortSearchParams() {
  return useQueryState<ColumnSort>(COLUMN_SORT_KEY, parseAsColumnSort)
}

export function useSorting() {
  const [columnSort, setColumnSort] = useColumnSortSearchParams()

  const sorting = React.useMemo<SortingState>(
    () => (columnSort ? [columnSort] : []),
    [columnSort]
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      setColumnSort((previousColumnSort) => {
        const newSorting =
          typeof updaterOrValue === "function"
            ? updaterOrValue(previousColumnSort ? [previousColumnSort] : [])
            : updaterOrValue

        return newSorting[0] ?? null
      })
    },
    [setColumnSort]
  )

  return { sorting, onSortingChange }
}

export function useSortingValues() {
  const [sorting] = useColumnSortSearchParams()

  const ordering = React.useMemo(
    () => ({
      ordering: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
    }),
    [sorting]
  )

  return ordering
}
