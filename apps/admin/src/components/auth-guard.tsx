"use client"

import { useSession } from "@/hooks/use-auth"
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

/** Renders its children only with a session; otherwise goes to /login. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status, refetch } = useSession()

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])

  if (status === "authenticated") return children

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

export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
