import { useQuery } from "@tanstack/react-query"
import { customersListChoicesOptions } from "@workspace/api-client/query"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { useMemo } from "react"

/**
 * The customer filter options, loaded from the API, with the customer's avatar
 * as icon. The images load lazily: the list has every customer.
 */
export function useOrderFilterOptions() {
  const { data: customer } = useQuery({
    ...customersListChoicesOptions(),
    select: (data) =>
      data.map((item) => ({
        label: item.name,
        value: String(item.id),
        icon: (
          <Avatar className="size-4">
            {item.image && <AvatarImage src={item.image} loading="lazy" />}
            <AvatarFallback />
          </Avatar>
        ),
      })),
  })

  return useMemo(() => ({ customer }), [customer])
}
