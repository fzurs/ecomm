"use client"

import { TwoFactorSetup } from "@/components/two-factor"
import { loginUrl, useLogout, useSession } from "@/hooks/use-auth"
import { UserDetails } from "@workspace/api-client"
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
 * A user that isn't staff (e.g. a store customer) gets no admin at all. Where
 * 2FA is required, a session that didn't pass it sets it up first.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, status, refetch } = useSession()

  React.useEffect(() => {
    // E.g. the session expired with the page open: back here after logging in.
    if (status === "unauthenticated") {
      router.replace(
        loginUrl(window.location.pathname + window.location.search)
      )
    }
  }, [status, router])

  if (status === "authenticated" && user) {
    if (!user.is_staff) return <NoAccess />
    if (user.otp_required && !user.otp_verified) {
      return <TwoFactorRequired user={user} />
    }
    return children
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

/**
 * The API refuses the session until it passes 2FA. Without 2FA, it's set up
 * here; with it (a session from before it was turned on), logging in again
 * asks for the code.
 */
function TwoFactorRequired({ user }: { user: UserDetails }) {
  const logout = useLogout()

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="typeset">
          <h1>Two-factor authentication</h1>
          <p>
            {user.otp_enabled
              ? "Log in again with a code from your authenticator app."
              : "The admin requires it. Set it up to continue."}
          </p>
        </div>
        {!user.otp_enabled && <TwoFactorSetup />}
        <Button
          variant="ghost"
          className="self-start"
          disabled={logout.isPending}
          onClick={() => logout.mutate({})}
        >
          Log out
        </Button>
      </div>
    </div>
  )
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
