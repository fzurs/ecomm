"use client"
import { cn } from "@workspace/ui/lib/utils"
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
import { Login } from "@workspace/api-client"
import { zAuthLoginCreateBody } from "@workspace/api-client/zod"

const defaultValues: Login = {
  username: "",
  password: "",
}

function useLoginForm() {
  const { mutateAsync } = useLogin()

  return useAppForm({
    defaultValues,
    validators: { onSubmit: zAuthLoginCreateBody },
    // Awaited so the button shows the pending state; wrong credentials come
    // back as non_field_errors and are shown as a form error.
    onSubmit: async ({ value, formApi }) => {
      try {
        await mutateAsync({ body: value })
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useLoginForm()

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
