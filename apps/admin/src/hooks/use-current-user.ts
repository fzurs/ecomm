import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/lib/queries";

export function useCurrentUser() {
  const { data } = useQuery(currentUserQueryOptions);
  return data;
}
