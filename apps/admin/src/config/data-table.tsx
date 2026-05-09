import { getCategoriesQueryOptions } from "@/lib/query-options"
import { queryOptions } from "@tanstack/react-query"

export const dataTableConfig = {
  dataSources: {
    categories: queryOptions({
      ...getCategoriesQueryOptions(),
      select: (data) =>
        data.map(({ id, name }) => ({
          label: name,
          value: id.toString(),
        })),
    }),
  },
}
