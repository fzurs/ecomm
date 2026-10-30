"use client"

import {
  useAddPasskey,
  useAuthenticators,
  usePasskeyCreationOptions,
  useReauthenticate,
  useRemovePasskeys,
  useSession,
  useTotpActivate,
  useTotpDeactivate,
  useTotpStatus,
} from "@/hooks/use-auth"
import { useAppForm } from "@/hooks/form"
import { needsReauthentication, passkeyErrorMessage } from "@/lib/allauth"
import { applyServerErrors, getServerErrorMessage } from "@/lib/utils"
import { browserSupportsWebAuthn } from "@simplewebauthn/browser"
import type { WebAuthnAuthenticator } from "@workspace/api-client/allauth"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react"
import QRCode from "qrcode"
import * as React from "react"
import { z } from "zod"

/**
 * The 2FA section of the account: passkeys, and the authenticator app. The
 * first one added also brings the recovery codes, shown once.
 */
export function TwoFactorSettings() {
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(
    null
  )

  if (recoveryCodes) {
    return (
      <RecoveryCodes
        codes={recoveryCodes}
        onSaved={() => setRecoveryCodes(null)}
      />
    )
  }

  return (
    <div className="flex max-w-xl flex-col gap-10">
      <Section
        title="Passkeys"
        description="Your fingerprint, face or screen lock, on this device, your phone or a security key. Safer than codes: a passkey only works on this admin's site, so a fake one can't use it."
      >
        <Passkeys onRecoveryCodes={setRecoveryCodes} />
      </Section>
      <Section
        title="Authenticator app"
        description="A 6-digit code from an app on your phone (Google Authenticator, 1Password, Authy...)."
      >
        <AuthenticatorApp onRecoveryCodes={setRecoveryCodes} />
      </Section>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

/**
 * allauth asks for the password again before turning 2FA on or off, even right
 * after logging in. `run` tries the action; if allauth wants the password,
 * `reauthenticating` shows `ReauthenticateForm`, and the action runs again
 * once it's confirmed.
 */
function useWithReauthentication() {
  const [pending, setPending] = React.useState<(() => Promise<void>) | null>(
    null
  )

  const run = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (error) {
      if (!needsReauthentication(error)) throw error
      setPending(() => action)
    }
  }

  const confirmed = async () => {
    const action = pending
    setPending(null)
    if (action) await run(action)
  }

  return {
    run,
    reauthenticating: pending !== null,
    confirmed,
    cancel: () => setPending(null),
  }
}

/**
 * Turning 2FA on where it's required (`AuthGuard`): a passkey, or else the
 * authenticator app. Then the recovery codes, and the session is refetched,
 * now verified.
 */
export function TwoFactorSetup() {
  const { refetch } = useSession()
  const [useApp, setUseApp] = React.useState(false)
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(
    null
  )

  if (recoveryCodes) {
    return <RecoveryCodes codes={recoveryCodes} onSaved={() => refetch()} />
  }

  // Codes are only new with the account's first second factor.
  const added = (codes: string[] | null) =>
    codes ? setRecoveryCodes(codes) : refetch()

  if (useApp) return <TotpEnrollment onConfirmed={added} />

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-muted-foreground">
        Logging in will also ask for a passkey (your fingerprint, face or screen
        lock) or a code from an authenticator app.
      </p>
      <PasskeyAdd onAdded={added} primary />
      <Button variant="link" className="px-0" onClick={() => setUseApp(true)}>
        Use an authenticator app instead
      </Button>
    </div>
  )
}

/** The account's passkeys, to add and remove. */
function Passkeys({
  onRecoveryCodes,
}: {
  onRecoveryCodes: (codes: string[]) => void
}) {
  const authenticators = useAuthenticators()
  const passkeys =
    authenticators.data?.filter(
      (authenticator): authenticator is WebAuthnAuthenticator =>
        authenticator.type === "webauthn"
    ) ?? []

  if (authenticators.isPending) return <Spinner className="size-5" />

  return (
    <div className="flex flex-col gap-4">
      {passkeys.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {passkeys.map((passkey) => (
            <PasskeyItem key={passkey.id} passkey={passkey} />
          ))}
        </ul>
      )}
      <PasskeyAdd onAdded={(codes) => codes && onRecoveryCodes(codes)} />
    </div>
  )
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

// allauth's timestamps are seconds.
function formatTimestamp(seconds: number) {
  return dateFormat.format(new Date(seconds * 1000))
}

function PasskeyItem({ passkey }: { passkey: WebAuthnAuthenticator }) {
  const remove = useRemovePasskeys()
  const reauth = useWithReauthentication()
  const [error, setError] = React.useState<unknown>(null)

  const removePasskey = () => {
    setError(null)
    reauth
      .run(async () => {
        await remove.mutateAsync({ body: { authenticators: [passkey.id] } })
      })
      .catch(setError)
  }

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{passkey.name}</span>
          <span className="text-xs text-muted-foreground">
            Added {formatTimestamp(passkey.created_at)} ·{" "}
            {passkey.last_used_at
              ? `last used ${formatTimestamp(passkey.last_used_at)}`
              : "never used"}
          </span>
        </div>
        {!reauth.reauthenticating && (
          <Button
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={removePasskey}
          >
            {remove.isPending ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>
      {reauth.reauthenticating && (
        <ReauthenticateForm
          reason="Confirm your password to remove this passkey."
          onConfirmed={reauth.confirmed}
          onCancel={reauth.cancel}
        />
      )}
      {error !== null && (
        <p className="text-sm text-destructive">
          {getServerErrorMessage(error)}
        </p>
      )}
    </li>
  )
}

/** The "Add a passkey" button, and the steps it opens. */
function PasskeyAdd({
  onAdded,
  primary = false,
}: {
  onAdded: (recoveryCodes: string[] | null) => void
  primary?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  if (!browserSupportsWebAuthn()) {
    return (
      <p className="text-sm text-muted-foreground">
        This browser can&apos;t create passkeys.
      </p>
    )
  }

  if (!open) {
    return (
      <Button
        variant={primary ? "default" : "outline"}
        className="self-start"
        onClick={() => setOpen(true)}
      >
        <KeyRoundIcon />
        Add a passkey
      </Button>
    )
  }

  return (
    <PasskeyCreation
      onAdded={(codes) => {
        setOpen(false)
        onAdded(codes)
      }}
      onCancel={() => setOpen(false)}
    />
  )
}

/**
 * Creating a passkey. The challenge is fetched first (allauth may ask for the
 * password then), so the "Create" click opens the browser's prompt right away:
 * browsers only show it in direct response to a click.
 */
function PasskeyCreation({
  onAdded,
  onCancel,
}: {
  onAdded: (recoveryCodes: string[] | null) => void
  onCancel: () => void
}) {
  const options = usePasskeyCreationOptions()
  const add = useAddPasskey()
  const nameId = React.useId()
  const [name, setName] = React.useState("")

  if (options.isPending) return <Spinner className="size-5" />

  if (options.isError) {
    if (needsReauthentication(options.error)) {
      return (
        <ReauthenticateForm
          reason="Confirm your password to add a passkey."
          onConfirmed={async () => {
            await options.refetch()
          }}
          onCancel={onCancel}
        />
      )
    }
    return (
      <p className="text-sm text-destructive">
        {getServerErrorMessage(options.error)}
      </p>
    )
  }

  const create = () =>
    add.mutate(
      { name: name.trim() || "Passkey", optionsJSON: options.data },
      {
        onSuccess: onAdded,
        // A challenge is good for one attempt; on a 401 the refetch shows the
        // password step.
        onError: () => options.refetch(),
      }
    )

  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <Input
          id={nameId}
          value={name}
          placeholder="e.g. MacBook, iPhone, YubiKey"
          onChange={(e) => setName(e.target.value)}
          disabled={add.isPending}
          autoFocus
        />
        <FieldDescription>To tell your passkeys apart.</FieldDescription>
      </Field>
      {add.isError && <FieldError>{passkeyErrorMessage(add.error)}</FieldError>}
      <Field orientation="horizontal">
        <Button onClick={create} disabled={add.isPending}>
          <KeyRoundIcon />
          {add.isPending ? "Waiting for the passkey..." : "Create passkey"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={add.isPending}>
          Cancel
        </Button>
      </Field>
    </FieldGroup>
  )
}

/** The authenticator app: set it up, or turn it off. */
function AuthenticatorApp({
  onRecoveryCodes,
}: {
  onRecoveryCodes: (codes: string[]) => void
}) {
  const status = useTotpStatus()
  const [started, setStarted] = React.useState(false)

  if (status.isPending) return <Spinner className="size-5" />
  if (status.data?.enabled) return <TotpDisable />

  if (!started) {
    return (
      <Button
        variant="outline"
        className="self-start"
        onClick={() => setStarted(true)}
      >
        <ShieldCheckIcon />
        Set up the authenticator app
      </Button>
    )
  }

  return (
    <TotpEnrollment
      onConfirmed={(codes) =>
        codes ? onRecoveryCodes(codes) : setStarted(false)
      }
    />
  )
}

function TotpEnrollment({
  onConfirmed,
}: {
  onConfirmed: (codes: string[] | null) => void
}) {
  const status = useTotpStatus()
  const reauth = useWithReauthentication()

  if (status.isPending) return <Spinner className="size-5" />
  if (status.isError) {
    return (
      <p className="text-sm text-destructive">
        {getServerErrorMessage(status.error)}
      </p>
    )
  }
  // On already (e.g. from another tab): the session refetch shows it.
  if (status.data.enabled) return null

  const { secret, totpUrl } = status.data

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Scan the code with your authenticator app, then enter the code it shows.
      </p>
      <TotpQrCode url={totpUrl} />
      <p className="text-sm text-muted-foreground">
        Can&apos;t scan it? Enter this key:{" "}
        <code className="font-mono break-all text-foreground">{secret}</code>
      </p>
      {reauth.reauthenticating ? (
        <ReauthenticateForm
          reason="Confirm your password to turn on two-factor authentication."
          onConfirmed={reauth.confirmed}
          onCancel={reauth.cancel}
        />
      ) : (
        <ConfirmForm onConfirmed={onConfirmed} run={reauth.run} />
      )}
    </div>
  )
}

/** The otpauth URL as a QR code, drawn here: allauth only gives the URL. */
function TotpQrCode({ url }: { url: string }) {
  const [src, setSrc] = React.useState<string>()

  React.useEffect(() => {
    let current = true
    QRCode.toDataURL(url, { margin: 1, width: 180 }).then((dataUrl) => {
      if (current) setSrc(dataUrl)
    })
    return () => {
      current = false
    }
  }, [url])

  // White behind it: scanners need the contrast in dark mode too.
  return (
    <div className="flex size-[196px] items-center justify-center rounded-lg bg-white p-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- a data URL
        <img src={src} alt="QR code for your authenticator app" />
      ) : (
        <Spinner className="size-5 text-black" />
      )}
    </div>
  )
}

const codeSchema = z.object({
  code: z.string().length(6, "Enter the 6 digits."),
})

function ConfirmForm({
  onConfirmed,
  run,
}: {
  onConfirmed: (codes: string[] | null) => void
  run: (action: () => Promise<void>) => Promise<void>
}) {
  const { mutateAsync } = useTotpActivate()

  const form = useAppForm({
    defaultValues: { code: "" },
    validators: { onSubmit: codeSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await run(async () => onConfirmed(await mutateAsync(value.code)))
      } catch (error) {
        // A wrong code: empty, ready for the next one.
        formApi.setFieldValue("code", "")
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField
            name="code"
            children={(field) => (
              <field.OtpField
                label="Code from the app"
                onComplete={() => {
                  if (!form.state.isSubmitting) form.handleSubmit()
                }}
              />
            )}
          />
          <Field>
            <form.SubmitButton>Turn on</form.SubmitButton>
          </Field>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  )
}

const passwordSchema = z.object({
  password: z.string().min(1, "Enter your password."),
})

/** The password again, for allauth's reauthentication. */
function ReauthenticateForm({
  reason,
  onConfirmed,
  onCancel,
}: {
  reason: string
  onConfirmed: () => Promise<void>
  onCancel: () => void
}) {
  const { mutateAsync } = useReauthenticate()

  const form = useAppForm({
    defaultValues: { password: "" },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ body: value })
      } catch (error) {
        applyServerErrors(formApi, error)
        return
      }
      try {
        await onConfirmed()
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <p className="text-sm text-muted-foreground">{reason}</p>
          <form.AppField
            name="password"
            children={(field) => (
              <field.PasswordField label="Password" autoFocus />
            )}
          />
          <Field orientation="horizontal">
            <form.SubmitButton>Confirm</form.SubmitButton>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form.Form>
    </form.AppForm>
  )
}

/**
 * The recovery codes, once: each logs in once without the phone. Only after
 * the user says they saved them is the (now verified) session refetched.
 */
function RecoveryCodes({
  codes,
  onSaved,
}: {
  codes: string[]
  onSaved: () => void
}) {
  const { refetch } = useSession()

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>Two-factor authentication is on</AlertTitle>
        <AlertDescription>
          Save these recovery codes somewhere safe, like a password manager.
          Each one logs you in once if you lose your phone. They won&apos;t be
          shown again.
        </AlertDescription>
      </Alert>
      <ul className="grid grid-cols-2 gap-2 rounded-lg border p-4 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigator.clipboard.writeText(codes.join("\n"))}
        >
          Copy
        </Button>
        <Button
          onClick={() => {
            refetch()
            onSaved()
          }}
        >
          I saved them
        </Button>
      </div>
    </div>
  )
}

function TotpDisable() {
  const deactivate = useTotpDeactivate()
  const reauth = useWithReauthentication()
  const [error, setError] = React.useState<unknown>(null)

  const turnOff = () => {
    setError(null)
    reauth
      .run(async () => {
        await deactivate.mutateAsync({})
      })
      .catch(setError)
  }

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        The authenticator app is on. Turning it off leaves your passkeys, if
        any; without either, where two-factor authentication is required the
        admin stays locked until you add one again.
      </p>
      {reauth.reauthenticating ? (
        <ReauthenticateForm
          reason="Confirm your password to turn off two-factor authentication."
          onConfirmed={reauth.confirmed}
          onCancel={reauth.cancel}
        />
      ) : (
        <Button
          variant="destructive"
          className="self-start"
          disabled={deactivate.isPending}
          onClick={turnOff}
        >
          {deactivate.isPending ? "Turning off..." : "Turn off"}
        </Button>
      )}
      {error !== null && (
        <p className="text-sm text-destructive">
          {getServerErrorMessage(error)}
        </p>
      )}
    </div>
  )
}
