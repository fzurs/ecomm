"use client"

import {
  hashKey,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { useState } from "react"
import { isAuthError, sessionQueryKey } from "@/hooks/use-auth"
import { getErrorStatus } from "@/lib/utils"

function createQueryClient() {
  // A 401/403 anywhere may mean the session expired: recheck the session, and
  // if it's gone the AuthGuard sends the user to /login. A 403 for a missing
  // permission leaves the session valid, so nothing else happens.
  const recheckSession = (error: unknown) => {
    if (isAuthError(error)) {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey, exact: true })
    }
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        // A 4xx (a missing object, a bad id in the URL) fails the same on
        // every try: show it right away instead of after the retries.
        retry: (failureCount, error) => {
          const status = getErrorStatus(error)
          if (status && status < 500) return false
          return failureCount < 3
        },
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // The session query reports its own state to the AuthGuard.
        if (query.queryHash !== hashKey(sessionQueryKey)) recheckSession(error)
      },
    }),
    mutationCache: new MutationCache({ onError: recheckSession }),
  })

  return queryClient
}

export function ReactQueryProvider({
  children,
}: {
  children?: React.ReactNode
}) {
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
