import { useQuery } from "@tanstack/react-query"
import {
  brandsListChoicesOptions,
  categoriesListChoicesOptions,
} from "@workspace/api-client/query"
import { useMemo } from "react"

function selectAsOption(data: { name: string; slug?: string }[]) {
  return data.map((item) => ({ label: item.name, value: String(item.slug) }))
}

/** The category and brand filter options, loaded from the API. */
export function useProductFilterOptions() {
  const { data: category } = useQuery({
    ...categoriesListChoicesOptions(),
    select: selectAsOption,
  })

  const { data: brand } = useQuery({
    ...brandsListChoicesOptions(),
    select: selectAsOption,
  })

  return useMemo(() => ({ category, brand }), [category, brand])
}
