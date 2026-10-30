"use client"
import { postAllauthBrowserV1AuthProviderToken } from "@workspace/api-client/allauth"
import {
  Field,
  FieldError,
  FieldSeparator,
} from "@workspace/ui/components/field"
import Script from "next/script"
import * as React from "react"
import { useFinishLogin } from "@/hooks/use-finish-login"
import { formErrors, pendingFlow } from "@/lib/allauth"

// The part of Google Identity Services (accounts.google.com/gsi/client) used here.
type GoogleIdentity = {
  accounts: {
    id: {
      initialize(config: {
        client_id: string
        callback: (response: { credential: string }) => void
      }): void
      renderButton(
        parent: HTMLElement,
        options: {
          theme?: string
          size?: string
          text?: string
          width?: number
        }
      ): void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

/**
 * "Continue with Google": Google's own button gives an ID token, and allauth
 * checks it and logs in (or signs up) the customer. A request to the store's
 * /api like the password login, so the session cookie is the store's: no
 * redirect through the API's host.
 */
export function GoogleButton({ clientId }: { clientId: string }) {
  const finishLogin = useFinishLogin()
  const container = React.useRef<HTMLDivElement>(null)
  const [ready, setReady] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const logIn = React.useEffectEvent(async (idToken: string) => {
    setError(undefined)
    try {
      await postAllauthBrowserV1AuthProviderToken({
        body: {
          provider: "google",
          process: "login",
          token: { client_id: clientId, id_token: idToken },
        },
        throwOnError: true,
      })
    } catch (error) {
      setError(
        pendingFlow(error) === "provider_signup"
          ? // Its email belongs to an account allauth won't log into with Google.
            "There's already an account with this email. Sign in with your password."
          : formErrors(error).formError
      )
      return
    }
    finishLogin()
  })

  React.useEffect(() => {
    const google = window.google
    if (!ready || !google || !container.current) return
    google.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => logIn(credential),
    })
    google.accounts.id.renderButton(container.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: container.current.offsetWidth,
    })
  }, [ready, clientId])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        // Also on a later mount, when the script is already there.
        onReady={() => setReady(true)}
      />
      <div ref={container} className="flex h-10 w-full justify-center" />
      <FieldError>{error}</FieldError>
    </>
  )
}

/** The Google button above an email form (login, signup), and the separator between them. */
export function GoogleLogin({ clientId }: { clientId: string }) {
  return (
    <>
      <Field>
        <GoogleButton clientId={clientId} />
      </Field>
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
        Or with your email
      </FieldSeparator>
    </>
  )
}
