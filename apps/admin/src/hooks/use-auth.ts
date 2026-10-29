"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  auth2FaConfirmMutation,
  auth2FaDisableMutation,
  auth2FaSetupMutation,
  authLoginCreateMutation,
  authLogoutCreateMutation,
  authUserRetrieveOptions,
  authUserRetrieveQueryKey,
} from "@workspace/api-client/query"
import { useRouter } from "next/navigation"

export const sessionQueryKey = authUserRetrieveQueryKey()

/**
 * 401/403 from the API. With SessionAuthentication DRF answers 403 when there
 * is no session, so a 403 on the session query means "logged out".
 */
export function isAuthError(error: unknown) {
  const status = (error as { response?: { status?: number } } | null)?.response
    ?.status
  return status === 401 || status === 403
}

export type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error"

/** The logged-in user. "error" is a failure other than a missing session. */
export function useSession() {
  const query = useQuery({
    ...authUserRetrieveOptions(),
    // A missing session won't fix itself; network or server errors might.
    retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
  })

  const status: SessionStatus = query.isError
    ? isAuthError(query.error)
      ? "unauthenticated"
      : "error"
    : query.isSuccess
      ? "authenticated"
      : "loading"

  return { user: query.data, status, refetch: query.refetch }
}

/**
 * Whether the user has a Django permission ("app.codename", e.g.
 * "billing.add_invoice"). Only hides what the API would refuse anyway.
 */
export function useCan(permission: string) {
  const { user } = useSession()
  return user?.permissions.includes(permission) ?? false
}

/**
 * Logs in and starts from an empty cache, so nothing from a previous session
 * is shown to the new user.
 */
export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    ...authLoginCreateMutation(),
    onSuccess: () => {
      queryClient.clear()
      router.replace("/")
    },
  })
}

/**
 * Starts turning 2FA on: a new authenticator to scan (`qr_svg`), confirmed
 * with `useTwoFactorConfirm`.
 */
export function useTwoFactorSetup() {
  return useMutation(auth2FaSetupMutation())
}

/**
 * Turns 2FA on with a code from the new authenticator. Returns the backup
 * codes, which the API never shows again. The session is verified after it,
 * but isn't refetched here: where 2FA is required, `AuthGuard` would let the
 * user in before they saved the codes. Refetch it once they did.
 */
export function useTwoFactorConfirm() {
  return useMutation(auth2FaConfirmMutation())
}

/** Turns 2FA off, with the password and a code. */
export function useTwoFactorDisable() {
  const queryClient = useQueryClient()

  return useMutation({
    ...auth2FaDisableMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
  })
}

/**
 * Logs out and drops every cached query. Runs on failure too: if the session
 * already expired the user is logged out anyway.
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    ...authLogoutCreateMutation(),
    onSettled: () => {
      router.replace("/login")
      queryClient.clear()
    },
  })
}
