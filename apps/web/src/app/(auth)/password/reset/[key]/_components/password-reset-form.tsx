"use client"
import { postAllauthBrowserV1AuthPasswordReset } from "@workspace/api-client/allauth"
import { buttonVariants } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import Link from "next/link"
import * as React from "react"
import { SubmitButton, TextField } from "@/components/form"
import { useFinishLogin } from "@/hooks/use-finish-login"
import { formErrors, statusOf } from "@/lib/allauth"
import { type FormState, textOf } from "@/lib/form-state"

type ResetState = FormState & { changed?: boolean }

/** Sets the new password with the key of the link. */
export function PasswordResetForm({ resetKey }: { resetKey: string }) {
  const finishLogin = useFinishLogin()

  const [state, formAction] = React.useActionState(
    async (_: ResetState, formData: FormData): Promise<ResetState> => {
      try {
        await postAllauthBrowserV1AuthPasswordReset({
          body: { key: resetKey, password: textOf(formData, "password") },
          throwOnError: true,
        })
      } catch (error) {
        // Changed, but allauth doesn't log in after a reset: on to the login.
        if (statusOf(error) === 401) return { changed: true }
        const { fieldErrors, formError } = formErrors(error)
        return {
          fieldErrors,
          formError: fieldErrors?.key
            ? "This link is no longer valid. Ask for a new one."
            : formError,
        }
      }
      finishLogin("/account")
      return {}
    },
    {}
  )

  if (state.changed) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your password was changed. Sign in with the new one.
        </p>
        <Link href="/login" className={buttonVariants()}>
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <TextField
          label="New password"
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
          <SubmitButton>Change password</SubmitButton>
        </Field>
      </FieldGroup>
    </form>
  )
}
