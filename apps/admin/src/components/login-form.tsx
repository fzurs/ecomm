"use client"
import { cn } from "cn"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldGroup } from "@workspace/ui/components/field"
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

/**
 * With 2FA on, the first submit (without a code) fails on `otp_code`: the
 * code field shows up and the next submit sends everything again.
 */
function useLoginForm() {
  const { mutateAsync } = useLogin()
  const [askCode, setAskCode] = React.useState(false)

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: zAuthLoginCreateBody },
    // Awaited so the button shows the pending state; wrong credentials come
    // back as non_field_errors and are shown as a form error.
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ body: value })
      } catch (error) {
        // The first time, asking for the code is enough: no error yet.
        if (!askCode && isCodeError(error)) {
          setAskCode(true)
          return
        }
        applyServerErrors(formApi, error)
      }
    },
  })

  return { form, askCode }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { form, askCode } = useLoginForm()

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form>
              <FieldGroup>
                <form.AppField
                  name="username"
                  children={(field) => <field.TextField label="Username" />}
                />
                <form.AppField
                  name="password"
                  children={(field) => <field.PasswordField label="Password" />}
                />
                {askCode && (
                  <form.AppField
                    name="otp_code"
                    children={(field) => (
                      <field.TextField
                        label="Code"
                        description="From your authenticator app, or one of your backup codes."
                        autoComplete="one-time-code"
                        autoFocus
                      />
                    )}
                  />
                )}
                <Field>
                  <form.SubmitButton className="w-full">
                    Login
                  </form.SubmitButton>
                </Field>
              </FieldGroup>
            </form.Form>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
