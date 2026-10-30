"use client"
import { postAllauthBrowserV1AuthEmailVerify } from "@workspace/api-client/allauth"
import { buttonVariants } from "@workspace/ui/components/button"
import { Field, FieldError, FieldGroup } from "@workspace/ui/components/field"
import Link from "next/link"
import * as React from "react"
import { SubmitButton } from "@/components/form"
import { useFinishLogin } from "@/hooks/use-finish-login"
import { formErrors, statusOf } from "@/lib/allauth"
import type { FormState } from "@/lib/form-state"

type ConfirmState = FormState & { confirmed?: boolean }

/**
 * Confirms the email with the key of the link. A button and not on load: mail
 * scanners open links too. In the browser that signed up it also logs in
 * (allauth kept that login waiting); in another one, it's on to the login.
 */
export function ConfirmEmailForm({ confirmKey }: { confirmKey: string }) {
  const finishLogin = useFinishLogin()

  const [state, formAction] = React.useActionState(
    async (): Promise<ConfirmState> => {
      try {
        await postAllauthBrowserV1AuthEmailVerify({
          body: { key: confirmKey },
          throwOnError: true,
        })
      } catch (error) {
        if (statusOf(error) === 401) return { confirmed: true }
        return formErrors(error)
      }
      finishLogin()
      return {}
    },
    {}
  )

  if (state.confirmed) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Your email is confirmed. Sign in to continue.
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
        <FieldError>
          {state.fieldErrors?.key
            ? "This link is no longer valid."
            : state.formError}
        </FieldError>
        <Field>
          <SubmitButton>Confirm email</SubmitButton>
        </Field>
      </FieldGroup>
    </form>
  )
}
