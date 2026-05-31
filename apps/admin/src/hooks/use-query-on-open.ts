import { useQuery } from "@tanstack/react-query"
import * as React from "react"

export function useQueryOnOpen<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  props: Parameters<typeof useQuery<TQueryFnData, TError, TData, TQueryKey>>[0]
) {
  const [open, setOpen] = React.useState(false)

  const query = useQuery({ ...props, enabled: open })

  return [query, { open, setOpen }] as const
}
