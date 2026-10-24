import { parseAsIndex, parseAsString, useQueryStates } from "nuqs"
import { useCallback } from "react"

/**
 * The list search term, kept in the `search` URL param. Changing it goes
 * back to the first page so the results don't land on an empty page.
 */
export function useSearch() {
  const [{ search }, setQueryStates] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsIndex.withDefault(1),
  })

  const setSearch = useCallback(
    (value: string) => setQueryStates({ search: value, page: null }),
    [setQueryStates]
  )

  return [search, setSearch] as const
}
