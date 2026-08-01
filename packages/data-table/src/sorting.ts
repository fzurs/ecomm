import { ColumnSort, OnChangeFn, SortingState } from "@tanstack/react-table"
import { createParser, useQueryState } from "nuqs"
import { useCallback, useMemo } from "react"

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
  return useQueryState<ColumnSort>("sort", parseAsColumnSort)
}

export function useDataTableSorting() {
  const [columnSort, setColumnSort] = useColumnSortSearchParams()

  const sorting = useMemo<SortingState>(
    () => (columnSort ? [columnSort] : []),
    [columnSort]
  )

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (udpater) => {
      setColumnSort((prevColSort) => {
        const next =
          typeof udpater === "function"
            ? udpater(prevColSort ? [prevColSort] : [])
            : udpater
        return next[0] ?? null
      })
    },
    [setColumnSort]
  )

  return { sorting, onSortingChange }
}

export function useSorting() {
  const [sorting] = useColumnSortSearchParams()

  const ordering = useMemo(
    () => ({
      ordering: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
    }),
    [sorting]
  )

  return ordering
}
