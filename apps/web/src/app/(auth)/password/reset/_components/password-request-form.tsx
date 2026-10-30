"use client"
import { postAllauthBrowserV1AuthPasswordRequest } from "@workspace/api-client/allauth"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import Link from "next/link"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { formErrors } from "@/lib/allauth"
import { type FormState, textOf } from "@/lib/form-state"
import { CheckYourEmail } from "../../../_components/check-your-email"

type RequestState = FormState & { sentTo?: string }

/** Asks for a password reset link. */
export function PasswordRequestForm() {
  const [state, formAction] = React.useActionState(
    async (_: RequestState, formData: FormData): Promise<RequestState> => {
      const email = textOf(formData, "email")
      try {
        await postAllauthBrowserV1AuthPasswordRequest({
          body: { email },
          throwOnError: true,
        })
      } catch (error) {
        return { ...formErrors(error), values: { email } }
      }
      return { sentTo: email }
    },
    {}
  )

  if (state.sentTo) {
    // allauth answers the same whether the account exists or not.
    return (
      <CheckYourEmail email={state.sentTo}>
        If there&apos;s an account with this email, we sent it a link to choose
        a new password.
      </CheckYourEmail>
    )
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        <FieldError>{state.formError}</FieldError>
        <Field>
          <SubmitButton>Send link</SubmitButton>
          <FieldDescription className="text-center">
            Remembered it? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
