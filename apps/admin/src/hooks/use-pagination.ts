import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs"
import { useMemo } from "react"

export function usePagination() {
  const [{ page: pageIndex, perPage }] = useQueryStates({
    page: parseAsIndex.withDefault(0),
    perPage: parseAsInteger.withDefault(10),
  })

  return useMemo(
    () => ({ limit: perPage, offset: pageIndex * perPage }),
    [pageIndex, perPage]
  )
}
