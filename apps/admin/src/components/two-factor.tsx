"use client"

import {
  useSession,
  useTwoFactorConfirm,
  useTwoFactorDisable,
  useTwoFactorSetup,
} from "@/hooks/use-auth"
import { useAppForm } from "@/hooks/form"
import { applyServerErrors, getServerErrorMessage } from "@/lib/utils"
import { UserDetails } from "@workspace/api-client"
import {
  zAuth2FaConfirmBody,
  zAuth2FaDisableBody,
} from "@workspace/api-client/zod"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { ShieldCheckIcon } from "lucide-react"
import * as React from "react"

/** The 2FA section of the account: turn it on, or off. */
export function TwoFactorSettings({ user }: { user: UserDetails }) {
  if (user.otp_enabled) return <TwoFactorDisableForm />
  return <TwoFactorSetup />
}

/**
 * Turning 2FA on: a QR code to scan with an authenticator app, a code from it
 * to confirm, and the backup codes, shown once.
 */
export function TwoFactorSetup() {
  const setup = useTwoFactorSetup()
  const [backupCodes, setBackupCodes] = React.useState<string[] | null>(null)

  if (backupCodes) return <BackupCodes codes={backupCodes} />

  if (!setup.data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          Logging in will also ask for a code from an authenticator app (Google
          Authenticator, 1Password, Authy...) on your phone.
        </p>
        <Button disabled={setup.isPending} onClick={() => setup.mutate({})}>
          <ShieldCheckIcon />
          {setup.isPending ? "Starting..." : "Set up two-factor authentication"}
        </Button>
        {setup.isError && (
          <p className="text-sm text-destructive">
            {getServerErrorMessage(setup.error)}
          </p>
        )}
      </div>
    )
  }

  const secret = new URL(setup.data.otpauth_url).searchParams.get("secret")

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Scan the code with your authenticator app, then enter the code it shows.
      </p>
      {/* The API's own SVG (segno), not user input. White behind it: scanners
          need the contrast in dark mode too. */}
      <div
        className="w-fit rounded-lg bg-white p-2"
        dangerouslySetInnerHTML={{ __html: setup.data.qr_svg }}
      />
      {secret && (
        <p className="text-sm text-muted-foreground">
          Can&apos;t scan it? Enter this key:{" "}
          <code className="font-mono break-all text-foreground">{secret}</code>
        </p>
      )}
      <ConfirmForm onConfirmed={setBackupCodes} />
    </div>
  )
}

function ConfirmForm({
  onConfirmed,
}: {
  onConfirmed: (codes: string[]) => void
}) {
  const { mutateAsync } = useTwoFactorConfirm()

  const form = useAppForm({
    defaultValues: { otp_code: "" },
    validators: { onSubmit: zAuth2FaConfirmBody },
    onSubmit: async ({ value, formApi }) => {
      try {
        const { backup_codes } = await mutateAsync({ body: value })
        onConfirmed(backup_codes)
      } catch (error) {
        // A wrong code: empty, ready for the next one.
        formApi.setFieldValue("otp_code", "")
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <form.AppForm>
      <form.Form>
        <FieldGroup>
          <form.AppField
            name="otp_code"
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

/**
 * The backup codes, once: each logs in once without the phone. Only after the
 * user says they saved them is the (now verified) session refetched.
 */
function BackupCodes({ codes }: { codes: string[] }) {
  const { refetch } = useSession()

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>Two-factor authentication is on</AlertTitle>
        <AlertDescription>
          Save these backup codes somewhere safe, like a password manager. Each
          one logs you in once if you lose your phone. They won&apos;t be shown
          again.
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

function TwoFactorDisableForm() {
  const { mutateAsync } = useTwoFactorDisable()

  const form = useAppForm({
    defaultValues: { password: "", otp_code: "" },
    validators: { onSubmit: zAuth2FaDisableBody },
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ body: value })
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Two-factor authentication is on. Turning it off needs your password and
        a code. Where it&apos;s required, the admin stays locked until you turn
        it on again.
      </p>
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="password"
              children={(field) => <field.PasswordField label="Password" />}
            />
            <form.AppField
              name="otp_code"
              children={(field) => (
                <field.TextField
                  label="Code"
                  description="From your authenticator app, or a backup code."
                  autoComplete="one-time-code"
                />
              )}
            />
            <Field>
              <form.SubmitButton variant="destructive">
                Turn off
              </form.SubmitButton>
            </Field>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    </div>
  )
}
