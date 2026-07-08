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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAppForm } from "@/hooks/form"
import { Login } from "@workspace/api-client"
import { authLoginCreateMutation } from "@workspace/api-client/query"
import { zAuthLoginCreateBody } from "@workspace/api-client/zod"

const defaultValues: Login = {
  username: "",
  email: "",
  password: "",
}

function useLoginForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    ...authLoginCreateMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      router.push("/")
    },
  })

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: zAuthLoginCreateBody },
    onSubmit: ({ value }) => mutate({ body: value }),
  })

  return form
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
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form.Form>
              <FieldGroup>
                <form.AppField
                  name="username"
                  children={(field) => (
                    <field.Field>
                      <field.Label>Username</field.Label>
                      <field.Input placeholder="@admin" />
                      <field.Message />
                    </field.Field>
                  )}
                />
                <form.AppField
                  name="email"
                  children={(field) => (
                    <field.Field>
                      <field.Label>Email</field.Label>
                      <field.Input type="email" placeholder="m@example.com" />
                      <field.Message />
                    </field.Field>
                  )}
                />
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.Field>
                      <field.Label>Password</field.Label>
                      <field.Input type="password" />
                      <field.Message />
                    </field.Field>
                  )}
                />
                <Field>
                  <form.Submit className="w-full">Login</form.Submit>
                </Field>
              </FieldGroup>
            </form.Form>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
