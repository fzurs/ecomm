"use client"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { updateProfile } from "../actions"

/** The name (a Server Action) and the email, which signs in and can't change here. */
export function ProfileForm({
  firstName,
  lastName,
  email,
}: {
  firstName: string
  lastName: string
  email: string
}) {
  const [state, formAction] = React.useActionState(updateProfile, {})
  const values = state.values ?? { first_name: firstName, last_name: lastName }

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="First name"
            name="first_name"
            autoComplete="given-name"
            defaultValue={values.first_name}
            error={state.fieldErrors?.first_name}
          />
          <TextField
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            defaultValue={values.last_name}
            error={state.fieldErrors?.last_name}
          />
        </div>
        {email && (
          <TextField label="Email" name="email" defaultValue={email} disabled />
        )}
        <FieldError>{state.formError}</FieldError>
        <Field orientation="horizontal">
          <SubmitButton>Save</SubmitButton>
          {state.saved && <FieldDescription>Saved.</FieldDescription>}
        </Field>
      </FieldGroup>
    </form>
  )
}
