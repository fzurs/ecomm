"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import {
  type AuthenticatorType,
  type GetAllauthBrowserV1AccountAuthenticatorsTotpErrors,
  getAllauthBrowserV1AccountAuthenticatorsRecoveryCodes,
  getAllauthBrowserV1AccountAuthenticatorsTotp,
  getAllauthBrowserV1AccountAuthenticatorsWebauthn,
  getAllauthBrowserV1AuthWebauthnAuthenticate,
  postAllauthBrowserV1AccountAuthenticatorsTotp,
  postAllauthBrowserV1AccountAuthenticatorsWebauthn,
  postAllauthBrowserV1AuthLogin,
  postAllauthBrowserV1AuthWebauthnAuthenticate,
} from "@workspace/api-client/allauth"
import {
  deleteAllauthBrowserV1AccountAuthenticatorsTotpMutation,
  deleteAllauthBrowserV1AccountAuthenticatorsWebauthnMutation,
  deleteAllauthBrowserV1AuthSessionMutation,
  getAllauthBrowserV1AccountAuthenticatorsOptions,
  getAllauthBrowserV1AccountAuthenticatorsQueryKey,
  getAllauthBrowserV1AccountAuthenticatorsTotpQueryKey,
  getAllauthBrowserV1AccountAuthenticatorsWebauthnQueryKey,
  getAllauthBrowserV1AuthWebauthnAuthenticateQueryKey,
  postAllauthBrowserV1Auth2FaAuthenticateMutation,
  postAllauthBrowserV1AuthReauthenticateMutation,
} from "@workspace/api-client/allauth/query"
import {
  authUserRetrieveOptions,
  authUserRetrieveQueryKey,
} from "@workspace/api-client/query"
import { useRouter } from "next/navigation"
import {
  creationOptionsJSON,
  pendingSecondFactor,
  requestOptionsJSON,
} from "@/lib/allauth"

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
 * Logs in with the password (allauth). Resolves `{ secondFactor: null }` when
 * done, or the second factors the account accepts when it has 2FA: allauth
 * keeps the login pending until `useSecondFactor` (a code) or
 * `usePasskeySecondFactor` completes it. Errors (wrong password) are
 * allauth's 400.
 */
export function useLogin() {
  const finishLogin = useFinishLogin()

  return useMutation({
    mutationFn: async (body: {
      username: string
      password: string
    }): Promise<{ secondFactor: AuthenticatorType[] | null }> => {
      try {
        await postAllauthBrowserV1AuthLogin({ body, throwOnError: true })
        return { secondFactor: null }
      } catch (error) {
        const secondFactor = pendingSecondFactor(error)
        if (secondFactor) return { secondFactor }
        throw error
      }
    },
    onSuccess: ({ secondFactor }) => {
      if (!secondFactor) finishLogin()
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
 * The challenge for logging in with a passkey, fetched as soon as the login
 * waits for one: the browser only shows its passkey prompt right after a
 * click, so the click can't wait for the network.
 */
export function usePasskeyLoginOptions(enabled: boolean) {
  return useQuery({
    queryKey: getAllauthBrowserV1AuthWebauthnAuthenticateQueryKey(),
    queryFn: async () => {
      const { data } = await getAllauthBrowserV1AuthWebauthnAuthenticate({
        throwOnError: true,
      })
      return requestOptionsJSON(data.data.request_options)
    },
    enabled,
    // One challenge per attempt: never reused from the cache.
    gcTime: 0,
    staleTime: Infinity,
  })
}

/** Completes a pending login with a passkey: the browser asks for it. */
export function usePasskeySecondFactor() {
  const finishLogin = useFinishLogin()

  return useMutation({
    mutationFn: async (
      optionsJSON: Awaited<ReturnType<typeof requestOptionsJSON>>
    ) => {
      const credential = await startAuthentication({ optionsJSON })
      await postAllauthBrowserV1AuthWebauthnAuthenticate({
        // The WebAuthn JSON allauth expects; its spec types it as any object.
        body: { credential: { ...credential } },
        throwOnError: true,
      })
    },
    onSuccess: finishLogin,
  })
}

/** The account's second factors: passkeys, the authenticator app, recovery codes. */
export function useAuthenticators() {
  return useQuery({
    ...getAllauthBrowserV1AccountAuthenticatorsOptions(),
    select: (response) => response.data,
  })
}

/**
 * The challenge for a new passkey. allauth may want the password first
 * (`needsReauthentication` on the error): fetched before the "Create" click
 * for the same reason as `usePasskeyLoginOptions`.
 */
export function usePasskeyCreationOptions() {
  return useQuery({
    queryKey: getAllauthBrowserV1AccountAuthenticatorsWebauthnQueryKey(),
    queryFn: async () => {
      const { data } = await getAllauthBrowserV1AccountAuthenticatorsWebauthn({
        throwOnError: true,
      })
      return creationOptionsJSON(data.data.creation_options)
    },
    retry: false,
    gcTime: 0,
    staleTime: Infinity,
  })
}

/**
 * Creates a passkey (the browser asks for it) and adds it. Returns the
 * recovery codes when it was the first second factor (allauth generates them
 * then), else null. Like `useTotpActivate`, the session isn't refetched here.
 */
export function useAddPasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      name,
      optionsJSON,
    }: {
      name: string
      optionsJSON: Awaited<ReturnType<typeof creationOptionsJSON>>
    }) => {
      const credential = await startRegistration({ optionsJSON })
      const { data } = await postAllauthBrowserV1AccountAuthenticatorsWebauthn({
        body: { name, credential: { ...credential } },
        throwOnError: true,
      })
      if (!data.meta.recovery_codes_generated) return null
      const codes = await getAllauthBrowserV1AccountAuthenticatorsRecoveryCodes(
        { throwOnError: true }
      )
      return codes.data.data.unused_codes
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsQueryKey(),
      }),
  })
}

/** Removes passkeys, by id. */
export function useRemovePasskeys() {
  const queryClient = useQueryClient()

  return useMutation({
    ...deleteAllauthBrowserV1AccountAuthenticatorsWebauthnMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
      queryClient.invalidateQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsQueryKey(),
      })
    },
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
 * Turns the authenticator app on with a code from it. Returns the recovery
 * codes when it was the first second factor (allauth generates them then),
 * else null. The session counts as verified after it, but isn't refetched
 * here: where 2FA is required, `AuthGuard` would let the user in before they
 * saved the codes. Refetch it once they did.
 */
export function useTotpActivate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await postAllauthBrowserV1AccountAuthenticatorsTotp({
        body: { code },
        throwOnError: true,
      })
      if (!data.meta?.recovery_codes_generated) return null
      const codes = await getAllauthBrowserV1AccountAuthenticatorsRecoveryCodes(
        { throwOnError: true }
      )
      return codes.data.data.unused_codes
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsTotpQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsQueryKey(),
      })
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
      queryClient.invalidateQueries({
        queryKey: getAllauthBrowserV1AccountAuthenticatorsQueryKey(),
      })
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
