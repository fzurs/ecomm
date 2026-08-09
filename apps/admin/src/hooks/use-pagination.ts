import { parseAsIndex, parseAsInteger, useQueryStates } from "nuqs"
import { useMemo } from "react"

export function usePagination() {
  const [{ page, perPage }] = useQueryStates({
    page: parseAsIndex.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
  })

  return useMemo(
    () => ({ limit: perPage, offset: (page - 1) * perPage }),
    [page, perPage]
  )
}
