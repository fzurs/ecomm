import { useQuery } from "@tanstack/react-query"
import {
  brandsListChoicesOptions,
  categoriesListChoicesOptions,
} from "@workspace/api-client/query"
import { useMemo } from "react"
import { getProductColumns } from "../_components/product-columns"

function selectAsOption(data: { name: string; slug?: string }[]) {
  return data.map((item) => ({ label: item.name, value: String(item.slug) }))
}

/** The product columns, with the category and brand filter options loaded. */
export function useProductColumns() {
  const { data: categoryOptions } = useQuery({
    ...categoriesListChoicesOptions(),
    select: selectAsOption,
  })

  const { data: brandOptions } = useQuery({
    ...brandsListChoicesOptions(),
    select: selectAsOption,
  })

  return useMemo(
    () => getProductColumns({ categoryOptions, brandOptions }),
    [categoryOptions, brandOptions]
  )
}
