"use client"

import { useLogout, useSession } from "@/hooks/use-auth"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Spinner } from "@workspace/ui/components/spinner"
import { useRouter } from "next/navigation"
import * as React from "react"

/**
 * Renders its children only with a staff session; otherwise goes to /login.
 * A user that isn't staff (e.g. a store customer) gets no admin at all.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, status, refetch } = useSession()

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  if (status === "authenticated") {
    return user?.is_staff ? children : <NoAccess />
  }

  if (status === "error") {
    return (
      <Empty className="min-h-svh">
        <EmptyHeader>
          <EmptyTitle>Could not reach the server</EmptyTitle>
          <EmptyDescription>
            Check your connection and try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <FullPageSpinner />
}

function NoAccess() {
  const logout = useLogout()

  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyTitle>No access</EmptyTitle>
        <EmptyDescription>
          This account can&apos;t use the admin. Log in with a staff account.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          disabled={logout.isPending}
          onClick={() => logout.mutate({})}
        >
          Log out
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
