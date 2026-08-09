import { parseAsColumnSort } from "@workspace/data-table/lib/parsers"
import { useQueryState } from "nuqs"
import { useMemo } from "react"

export function useOrdering() {
  const [sorting] = useQueryState("sort", parseAsColumnSort)

  return useMemo(
    () => ({
      ordering: sorting ? `${sorting.desc ? "-" : ""}${sorting.id}` : undefined,
    }),
    [sorting]
  )
}
