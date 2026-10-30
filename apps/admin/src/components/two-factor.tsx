"use client"

import {
  useReauthenticate,
  useSession,
  useTotpActivate,
  useTotpDeactivate,
  useTotpStatus,
} from "@/hooks/use-auth"
import { useAppForm } from "@/hooks/form"
import { needsReauthentication } from "@/lib/allauth"
import { applyServerErrors, getServerErrorMessage } from "@/lib/utils"
import { UserDetails } from "@workspace/api-client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import { ShieldCheckIcon } from "lucide-react"
import QRCode from "qrcode"
import * as React from "react"
import { z } from "zod"

/** The 2FA section of the account: turn it on, or off. */
export function TwoFactorSettings({ user }: { user: UserDetails }) {
  if (user.mfa_enabled) return <TwoFactorDisable />
  return <TwoFactorSetup />
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
 * Turning 2FA on: a QR code to scan with an authenticator app, a code from it
 * to confirm, and the recovery codes, shown once.
 */
export function TwoFactorSetup() {
  const [started, setStarted] = React.useState(false)
  const [recoveryCodes, setRecoveryCodes] = React.useState<string[] | null>(
    null
  )

  if (recoveryCodes) return <RecoveryCodes codes={recoveryCodes} />

  if (!started) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          Logging in will also ask for a code from an authenticator app (Google
          Authenticator, 1Password, Authy...) on your phone.
        </p>
        <Button onClick={() => setStarted(true)}>
          <ShieldCheckIcon />
          Set up two-factor authentication
        </Button>
      </div>
    )
  }

  return <TotpEnrollment onConfirmed={setRecoveryCodes} />
}

function TotpEnrollment({
  onConfirmed,
}: {
  onConfirmed: (codes: string[]) => void
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
  onConfirmed: (codes: string[]) => void
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
function RecoveryCodes({ codes }: { codes: string[] }) {
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
        <Button onClick={() => refetch()}>I saved them</Button>
      </div>
    </div>
  )
}

function TwoFactorDisable() {
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
        Two-factor authentication is on. Where it&apos;s required, the admin
        stays locked until you turn it on again.
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
