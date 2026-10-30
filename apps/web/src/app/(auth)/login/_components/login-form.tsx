"use client"
import { postAllauthBrowserV1AuthLogin } from "@workspace/api-client/allauth"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import { MailIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { useFinishLogin } from "@/hooks/use-finish-login"
import { formErrors, pendingFlow, statusOf } from "@/lib/allauth"
import { type FormState, textOf } from "@/lib/form-state"
import { withNext } from "@/lib/navigation"

type LoginState = FormState & { unconfirmed?: boolean }

export function LoginForm({ children }: { children?: React.ReactNode }) {
  const finishLogin = useFinishLogin()
  const next = useSearchParams().get("next")

  const [state, formAction] = React.useActionState(
    async (_: LoginState, formData: FormData): Promise<LoginState> => {
      const email = textOf(formData, "email")
      const password = textOf(formData, "password")
      try {
        await postAllauthBrowserV1AuthLogin({
          body: { email, password },
          throwOnError: true,
        })
      } catch (error) {
        const flow = pendingFlow(error)
        // An account that didn't confirm its email: allauth sent the link again.
        if (flow === "verify_email") {
          return { unconfirmed: true, values: { email } }
        }
        if (flow === "mfa_authenticate") {
          return {
            formError:
              "This account uses two-factor authentication. Sign in from the admin.",
            values: { email },
          }
        }
        // 409: already logged in (e.g. in another tab), so just go on.
        if (statusOf(error) !== 409) {
          return { ...formErrors(error), values: { email } }
        }
      }
      finishLogin()
      return {}
    },
    {}
  )

  return (
    <form action={formAction}>
      <FieldGroup>
        {children}
        {state.unconfirmed && (
          <Alert>
            <MailIcon />
            <AlertTitle>Confirm your email first</AlertTitle>
            <AlertDescription>
              We sent you a new link to {state.values?.email}. Open it to finish
              signing in.
            </AlertDescription>
          </Alert>
        )}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
          labelAction={
            <Link
              href="/password/reset"
              className="text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          }
        />
        <FieldError>{state.formError}</FieldError>
        <Field>
          <SubmitButton>Sign in</SubmitButton>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href={withNext("/signup", next)}>Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
