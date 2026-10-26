import { useQuery } from "@tanstack/react-query"
import { customersListChoicesOptions } from "@workspace/api-client/query"
import { useMemo } from "react"

/** The customer filter options, loaded from the API. */
export function useOrderFilterOptions() {
  const { data: customer } = useQuery({
    ...customersListChoicesOptions(),
    select: (data) =>
      data.map((item) => ({ label: item.name, value: String(item.id) })),
  })

  return useMemo(() => ({ customer }), [customer])
}
