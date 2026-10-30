"use client"
import { postAllauthBrowserV1AccountPasswordChange } from "@workspace/api-client/allauth"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@workspace/ui/components/field"
import { useRouter } from "next/navigation"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { formErrors } from "@/lib/allauth"
import { type FormState, textOf } from "@/lib/form-state"

type PasswordState = FormState & { saved?: boolean }

/**
 * Changes the password (allauth, from the browser), or sets the first one of
 * an account created with Google, which has none to confirm.
 */
export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter()

  const [state, formAction] = React.useActionState(
    async (_: PasswordState, formData: FormData): Promise<PasswordState> => {
      const new_password = textOf(formData, "new_password")
      try {
        await postAllauthBrowserV1AccountPasswordChange({
          body: hasPassword
            ? {
                current_password: textOf(formData, "current_password"),
                new_password,
              }
            : { new_password },
          throwOnError: true,
        })
      } catch (error) {
        return formErrors(error)
      }
      // A first password changes what this form asks for.
      if (!hasPassword) router.refresh()
      return { saved: true }
    },
    {}
  )

  return (
    <form action={formAction}>
      <FieldGroup>
        {hasPassword && (
          <TextField
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            error={state.fieldErrors?.current_password}
          />
        )}
        <TextField
          label="New password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          description="At least 8 characters."
          error={state.fieldErrors?.new_password}
        />
        <FieldError>{state.formError}</FieldError>
        <Field orientation="horizontal">
          <SubmitButton>
            {hasPassword ? "Change password" : "Set password"}
          </SubmitButton>
          {state.saved && <FieldDescription>Password saved.</FieldDescription>}
        </Field>
      </FieldGroup>
    </form>
  )
}
