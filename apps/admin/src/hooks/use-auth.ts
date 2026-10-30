"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type GetAllauthBrowserV1AccountAuthenticatorsTotpErrors,
  getAllauthBrowserV1AccountAuthenticatorsRecoveryCodes,
  getAllauthBrowserV1AccountAuthenticatorsTotp,
  postAllauthBrowserV1AccountAuthenticatorsTotp,
  postAllauthBrowserV1AuthLogin,
} from "@workspace/api-client/allauth"
import {
  deleteAllauthBrowserV1AccountAuthenticatorsTotpMutation,
  deleteAllauthBrowserV1AuthSessionMutation,
  getAllauthBrowserV1AccountAuthenticatorsTotpQueryKey,
  postAllauthBrowserV1Auth2FaAuthenticateMutation,
  postAllauthBrowserV1AuthReauthenticateMutation,
} from "@workspace/api-client/allauth/query"
import {
  authUserRetrieveOptions,
  authUserRetrieveQueryKey,
} from "@workspace/api-client/query"
import { useRouter } from "next/navigation"
import { needsSecondFactor } from "@/lib/allauth"

export const sessionQueryKey = authUserRetrieveQueryKey()

/** /login, coming back to `path` after logging in (as `src/proxy.ts` does). */
export function loginUrl(path: string) {
  return path === "/" ? "/login" : `/login?next=${encodeURIComponent(path)}`
}

/**
 * Where to go once logged in: the `next` of the URL, only if it's a path of
 * this app (not `//evil.com`, which the browser reads as another site).
 */
export function afterLoginPath() {
  const next = new URLSearchParams(window.location.search).get("next")
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/"
}

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
 * After logging in (with or without a second factor): an empty cache, so
 * nothing from a previous session is shown to the new user, and back to where
 * they were going.
 */
function useFinishLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return () => {
    queryClient.clear()
    router.replace(afterLoginPath())
  }
}

/**
 * Logs in with the password (allauth). Resolves "done", or "second_factor"
 * when the account has 2FA: allauth keeps the login pending until
 * `useSecondFactor` gets the code. Errors (wrong password) are allauth's 400.
 */
export function useLogin() {
  const finishLogin = useFinishLogin()

  return useMutation({
    mutationFn: async (body: { username: string; password: string }) => {
      try {
        await postAllauthBrowserV1AuthLogin({ body, throwOnError: true })
        return "done" as const
      } catch (error) {
        if (needsSecondFactor(error)) return "second_factor" as const
        throw error
      }
    },
    onSuccess: (step) => {
      if (step === "done") finishLogin()
    },
  })
}

/** Completes a pending login with a code: the authenticator's or a recovery code. */
export function useSecondFactor() {
  const finishLogin = useFinishLogin()

  return useMutation({
    ...postAllauthBrowserV1Auth2FaAuthenticateMutation(),
    onSuccess: finishLogin,
  })
}

/**
 * allauth asks for the password again before turning 2FA on or off, even right
 * after logging in (`needsReauthentication`). Then the action is retried.
 */
export function useReauthenticate() {
  return useMutation(postAllauthBrowserV1AuthReauthenticateMutation())
}

export type TotpStatus =
  | { enabled: true }
  | { enabled: false; secret: string; totpUrl: string }

/**
 * Whether 2FA (TOTP) is on and, if not, the new secret to scan: allauth
 * answers the latter as a 404 with it.
 */
export function useTotpStatus() {
  return useQuery({
    queryKey: getAllauthBrowserV1AccountAuthenticatorsTotpQueryKey(),
    queryFn: async (): Promise<TotpStatus> => {
      try {
        await getAllauthBrowserV1AccountAuthenticatorsTotp({
          throwOnError: true,
        })
        return { enabled: true }
      } catch (error) {
        const response = (
          error as {
            response?: {
              status: number
              data: GetAllauthBrowserV1AccountAuthenticatorsTotpErrors[404]
            }
          }
        ).response
        if (response?.status !== 404) throw error
        const { secret, totp_url } = response.data.meta
        return { enabled: false, secret, totpUrl: totp_url }
      }
    },
    // A new secret each time would make the scanned one useless.
    staleTime: Infinity,
  })
}

/**
 * Turns 2FA on with a code from the new authenticator, and returns the
 * recovery codes. The session counts as verified after it, but isn't refetched
 * here: where 2FA is required, `AuthGuard` would let the user in before they
 * saved the codes. Refetch it once they did.
 */
export function useTotpActivate() {
  return useMutation({
    mutationFn: async (code: string) => {
      await postAllauthBrowserV1AccountAuthenticatorsTotp({
        body: { code },
        throwOnError: true,
      })
      const { data } =
        await getAllauthBrowserV1AccountAuthenticatorsRecoveryCodes({
          throwOnError: true,
        })
      return data.data.unused_codes
    },
  })
}

/** Turns 2FA off. */
export function useTotpDeactivate() {
  const queryClient = useQueryClient()

  return useMutation({
    ...deleteAllauthBrowserV1AccountAuthenticatorsTotpMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
      queryClient.removeQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsTotpQueryKey(),
      })
    },
  })
}

/**
 * Logs out and drops every cached query. Runs on failure too: allauth answers
 * a logout with 401 (no session left), and if the session had already expired
 * the user is logged out anyway.
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    ...deleteAllauthBrowserV1AuthSessionMutation(),
    onSettled: () => {
      router.replace("/login")
      queryClient.clear()
    },
  })
}
