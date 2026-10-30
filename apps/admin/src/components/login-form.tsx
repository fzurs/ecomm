"use client"
import { cn } from "cn"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import { browserSupportsWebAuthn } from "@simplewebauthn/browser"
import type { AuthenticatorType } from "@workspace/api-client/allauth"
import {
  GalleryVerticalEndIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { z } from "zod"
import { useAppForm } from "@/hooks/form"
import {
  useLogin,
  usePasskeyLoginOptions,
  usePasskeySecondFactor,
  useSecondFactor,
} from "@/hooks/use-auth"
import { passkeyErrorMessage } from "@/lib/allauth"
import { applyServerErrors } from "@/lib/utils"
import * as React from "react"

// Both steps in one form: the password step sends username and password, the
// code step only the code (allauth keeps the login pending in the session).
const defaultValues = { username: "", password: "", code: "" }

const credentialsSchema = z.object({
  username: z.string().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
  code: z.string(),
})

const codeSchema = credentialsSchema.extend({
  code: z.string().min(1, "Enter the code."),
})

// How the second step completes the login: a passkey, the authenticator's 6
// digits, or a recovery code.
type CodeKind = "passkey" | "app" | "backup"

const kindTypes: Record<CodeKind, AuthenticatorType> = {
  passkey: "webauthn",
  app: "totp",
  backup: "recovery_codes",
}

const switchLabels: Record<CodeKind, string> = {
  passkey: "Use your passkey",
  app: "Use your authenticator app",
  backup: "Lost your devices? Use a recovery code",
}

const descriptions: Record<CodeKind, string> = {
  passkey: "Use the passkey on this device, or on your phone or security key.",
  app: "Enter the 6-digit code from your authenticator app.",
  backup:
    "Enter one of the recovery codes you saved when you set up two-factor authentication.",
}

/** The kinds the account has, the passkey first where the browser can use it. */
function availableKinds(types: AuthenticatorType[]): CodeKind[] {
  const kinds = (["passkey", "app", "backup"] as const).filter((kind) =>
    types.includes(kindTypes[kind])
  )
  return browserSupportsWebAuthn()
    ? kinds
    : kinds.filter((kind) => kind !== "passkey")
}

/**
 * With 2FA on, the password leaves the login pending (`useLogin` resolves the
 * account's second factors): the form moves to the second step, which
 * completes it with a code (submit) or a passkey (`PasskeyButton`).
 */
function useLoginForm() {
  const login = useLogin()
  const secondFactor = useSecondFactor()
  const [kinds, setKinds] = React.useState<CodeKind[] | null>(null)
  const [codeKind, setCodeKind] = React.useState<CodeKind>("app")
  // Logged in, and on the way home: the submit is over by then, but nothing
  // may come back to life while home loads.
  const [loggedIn, setLoggedIn] = React.useState(false)
  const askCode = kinds !== null

  const form = useAppForm({
    defaultValues,
    // Each step checks its own fields (the options update on every render).
    validators: { onSubmit: askCode ? codeSchema : credentialsSchema },
    // Awaited so the button shows the pending state; allauth's errors (wrong
    // password, wrong code) go to their fields or to the form.
    onSubmit: async ({ value, formApi }) => {
      try {
        if (!askCode) {
          const { secondFactor: types } = await login.mutateAsync({
            username: value.username,
            password: value.password,
          })
          if (types) {
            const available = availableKinds(types)
            setKinds(available)
            setCodeKind(available[0] ?? "backup")
            return
          }
        } else {
          await secondFactor.mutateAsync({ body: { code: value.code } })
        }
        setLoggedIn(true)
      } catch (error) {
        // A wrong code: empty, ready for the next one.
        if (askCode) formApi.setFieldValue("code", "")
        applyServerErrors(formApi, error)
      }
    },
  })

  const switchCodeKind = (kind: CodeKind) => {
    setCodeKind(kind)
    form.setFieldValue("code", "", { dontUpdateMeta: true })
  }

  // Back to username and password, e.g. to log in with another account. The
  // next login replaces the pending one.
  const cancelCode = () => {
    setKinds(null)
    form.setFieldValue("code", "", { dontUpdateMeta: true })
  }

  // Filling the last box logs in, unless a submit is already on its way.
  const submitCode = () => {
    if (!form.state.isSubmitting) form.handleSubmit()
  }

  return {
    form,
    askCode,
    kinds: kinds ?? [],
    codeKind,
    loggedIn,
    setLoggedIn,
    switchCodeKind,
    cancelCode,
    submitCode,
  }
}

/**
 * The passkey button of the second step. The challenge is fetched as soon as
 * it shows: the browser's prompt has to open right on the click.
 */
function PasskeyButton({
  disabled,
  onLoggedIn,
}: {
  disabled: boolean
  onLoggedIn: () => void
}) {
  const options = usePasskeyLoginOptions(true)
  const passkey = usePasskeySecondFactor()

  const authenticate = () => {
    if (!options.data) return
    passkey.mutate(options.data, {
      onSuccess: onLoggedIn,
      // A challenge is good for one attempt.
      onError: () => options.refetch(),
    })
  }

  return (
    <Field>
      <Button
        type="button"
        className="w-full"
        disabled={disabled || !options.data || passkey.isPending}
        onClick={authenticate}
      >
        <KeyRoundIcon />
        {passkey.isPending ? "Waiting for the passkey..." : "Use your passkey"}
      </Button>
      {passkey.isError && (
        <FieldError className="text-center">
          {passkeyErrorMessage(passkey.error)}
        </FieldError>
      )}
    </Field>
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    form,
    askCode,
    kinds,
    codeKind,
    loggedIn,
    setLoggedIn,
    switchCodeKind,
    cancelCode,
    submitCode,
  } = useLoginForm()

  // Layout of shadcn's login-05 block: no card, the header inside the form.
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex size-8 items-center justify-center rounded-md">
                {askCode ? (
                  <ShieldCheckIcon className="size-6" />
                ) : (
                  // The same mark as the sidebar header.
                  <GalleryVerticalEndIcon className="size-6" />
                )}
              </div>
              <h1 className="text-xl font-bold">
                {askCode ? "Two-factor authentication" : "Welcome to Acme Inc."}
              </h1>
              <FieldDescription>
                {askCode
                  ? descriptions[codeKind]
                  : "Log in with your admin account."}
              </FieldDescription>
            </div>
            {/* Hidden on the code step: the password was already accepted. */}
            <div className={cn("contents", askCode && "hidden")}>
              <form.AppField
                name="username"
                children={(field) => <field.TextField label="Username" />}
              />
              <form.AppField
                name="password"
                children={(field) => <field.PasswordField label="Password" />}
              />
            </div>
            {/* Locked while the login is sent and after it succeeds, until
                home replaces the page. */}
            <form.Subscribe
              selector={(state) => [state.isSubmitting, state.isPristine]}
              children={([isSubmitting, isPristine]) => {
                const busy = isSubmitting || loggedIn
                return (
                  <>
                    {askCode && codeKind === "app" && (
                      <form.AppField
                        name="code"
                        children={(field) => (
                          <field.OtpField
                            label="Authentication code"
                            onComplete={submitCode}
                            disabled={busy}
                          />
                        )}
                      />
                    )}
                    {askCode && codeKind === "backup" && (
                      <form.AppField
                        name="code"
                        children={(field) => (
                          <field.TextField
                            label="Recovery code"
                            autoComplete="off"
                            autoFocus
                            disabled={busy}
                            className="font-mono"
                          />
                        )}
                      />
                    )}
                    {askCode && codeKind === "passkey" && (
                      <PasskeyButton
                        disabled={busy}
                        onLoggedIn={() => setLoggedIn(true)}
                      />
                    )}
                    <Field>
                      {codeKind !== "passkey" || !askCode ? (
                        <form.SubmitButton
                          className="w-full"
                          disabled={busy || isPristine}
                        >
                          {askCode ? "Verify" : "Login"}
                        </form.SubmitButton>
                      ) : null}
                      {askCode && (
                        <FieldDescription className="flex flex-col items-center gap-1">
                          {kinds
                            .filter((kind) => kind !== codeKind)
                            .map((kind) => (
                              <Button
                                key={kind}
                                type="button"
                                variant="link"
                                size="sm"
                                disabled={busy}
                                onClick={() => switchCodeKind(kind)}
                              >
                                {switchLabels[kind]}
                              </Button>
                            ))}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="text-muted-foreground"
                            disabled={busy}
                            onClick={cancelCode}
                          >
                            Back to login
                          </Button>
                        </FieldDescription>
                      )}
                    </Field>
                  </>
                )
              }}
            />
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    </div>
  )
}
