"use client"
import { postAllauthBrowserV1AuthSignup } from "@workspace/api-client/allauth"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { useFinishLogin } from "@/hooks/use-finish-login"
import { formErrors, pendingFlow } from "@/lib/allauth"
import { type FormState, textOf } from "@/lib/form-state"
import { withNext } from "@/lib/navigation"
import { CheckYourEmail } from "../../_components/check-your-email"

type SignupState = FormState & { sentTo?: string }

/**
 * Signs up with email and password. allauth then waits for the email to be
 * confirmed (`verify_email`): the link logs the customer in.
 */
export function SignupForm({ children }: { children?: React.ReactNode }) {
  const finishLogin = useFinishLogin()
  const next = useSearchParams().get("next")

  const [state, formAction] = React.useActionState(
    async (_: SignupState, formData: FormData): Promise<SignupState> => {
      const email = textOf(formData, "email")
      const password = textOf(formData, "password")
      try {
        await postAllauthBrowserV1AuthSignup({
          body: { email, password },
          throwOnError: true,
        })
      } catch (error) {
        // Also when the email already has an account: allauth answers the
        // same and tells its owner by email, so nobody learns it exists.
        if (pendingFlow(error) === "verify_email") return { sentTo: email }
        return { ...formErrors(error), values: { email } }
      }
      finishLogin()
      return {}
    },
    {}
  )

  if (state.sentTo) {
    return (
      <CheckYourEmail email={state.sentTo}>
        Open the link we sent to confirm it and finish signing up. On this
        device, it signs you in too.
      </CheckYourEmail>
    )
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        {children}
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
          autoComplete="new-password"
          required
          minLength={8}
          description="At least 8 characters."
          error={state.fieldErrors?.password}
        />
        <FieldError>{state.formError}</FieldError>
        <Field>
          <SubmitButton>Create account</SubmitButton>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href={withNext("/login", next)}>Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
