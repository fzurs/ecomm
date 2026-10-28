"use client"

import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import Link from "next/link"
import { AppHeader, AppHeaderNav } from "@/components/app-header"
import { getErrorStatus } from "@/lib/utils"

/**
 * A page's query failed: a 404 (the object doesn't exist, or the URL has a bad
 * id like /invoices/new) shows "not found"; anything else, a retry.
 */
export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  // Without the reset, useSuspenseQuery throws the cached error again.
  const { reset } = useQueryErrorResetBoundary()
  const notFound = getErrorStatus(error) === 404

  return (
    <>
      <AppHeader>
        <AppHeaderNav page={notFound ? "Not found" : "Error"} />
      </AppHeader>
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyTitle>
            {notFound ? "Page not found" : "Something went wrong"}
          </EmptyTitle>
          <EmptyDescription>
            {notFound
              ? "What you are looking for doesn't exist or was deleted."
              : "The page could not be loaded. Try again."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {notFound ? (
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Go home
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                reset()
                unstable_retry()
              }}
            >
              Try again
            </Button>
          )}
        </EmptyContent>
      </Empty>
    </>
  )
}
