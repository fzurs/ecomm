"use client"
import { cn } from "cn"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import { GalleryVerticalEndIcon, ShieldCheckIcon } from "lucide-react"
import { useAppForm } from "@/hooks/form"
import { useLogin } from "@/hooks/use-auth"
import { applyServerErrors } from "@/lib/utils"
import { LoginWritable } from "@workspace/api-client"
import { zAuthLoginCreateBody } from "@workspace/api-client/zod"
import * as React from "react"

const defaultValues: LoginWritable = {
  username: "",
  password: "",
  otp_code: "",
}

/** Whether the API refused the login for a missing or wrong 2FA code. */
function isCodeError(error: unknown) {
  const data = (error as { response?: { data?: unknown } } | null)?.response
    ?.data
  return !!data && typeof data === "object" && "otp_code" in data
}

// What the code step asks for: the authenticator's 6 digits, or a backup code.
type CodeKind = "app" | "backup"

/**
 * With 2FA on, the first submit (without a code) fails on `otp_code`: the
 * form moves to the code step, and the next submit sends everything again.
 */
function useLoginForm() {
  const { mutateAsync } = useLogin()
  const [askCode, setAskCode] = React.useState(false)
  const [codeKind, setCodeKind] = React.useState<CodeKind>("app")
  // Logged in, and on the way home: the submit is over by then, but nothing
  // may come back to life while home loads.
  const [loggedIn, setLoggedIn] = React.useState(false)

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: zAuthLoginCreateBody },
    // Awaited so the button shows the pending state; wrong credentials come
    // back as non_field_errors and are shown as a form error.
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ body: value })
        setLoggedIn(true)
      } catch (error) {
        if (isCodeError(error)) {
          // The first time, asking for the code is enough: no error yet.
          if (!askCode) {
            setAskCode(true)
            return
          }
          // A wrong code: empty, ready for the next one.
          formApi.setFieldValue("otp_code", "")
        }
        applyServerErrors(formApi, error)
      }
    },
  })

  const switchCodeKind = (kind: CodeKind) => {
    setCodeKind(kind)
    form.setFieldValue("otp_code", "", { dontUpdateMeta: true })
  }

  // Back to username and password, e.g. to log in with another account.
  const cancelCode = () => {
    setAskCode(false)
    setCodeKind("app")
    form.setFieldValue("otp_code", "", { dontUpdateMeta: true })
  }

  // Filling the last box logs in, unless a submit is already on its way.
  const submitCode = () => {
    if (!form.state.isSubmitting) form.handleSubmit()
  }

  return {
    form,
    askCode,
    codeKind,
    loggedIn,
    switchCodeKind,
    cancelCode,
    submitCode,
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    form,
    askCode,
    codeKind,
    loggedIn,
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
                {!askCode
                  ? "Log in with your admin account."
                  : codeKind === "app"
                    ? "Enter the 6-digit code from your authenticator app."
                    : "Enter one of the backup codes you saved when you set up two-factor authentication."}
              </FieldDescription>
            </div>
            {/* Hidden, not unmounted, on the code step: the login sends them
                again with the code. */}
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
                        name="otp_code"
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
                        name="otp_code"
                        children={(field) => (
                          <field.TextField
                            label="Backup code"
                            autoComplete="off"
                            autoFocus
                            disabled={busy}
                            className="font-mono"
                          />
                        )}
                      />
                    )}
                    <Field>
                      <form.SubmitButton
                        className="w-full"
                        disabled={busy || isPristine}
                      >
                        {askCode ? "Verify" : "Login"}
                      </form.SubmitButton>
                      {askCode && (
                        <FieldDescription className="flex flex-col items-center gap-1">
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              switchCodeKind(
                                codeKind === "app" ? "backup" : "app"
                              )
                            }
                          >
                            {codeKind === "app"
                              ? "Lost your phone? Use a backup code"
                              : "Use your authenticator app instead"}
                          </Button>
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
