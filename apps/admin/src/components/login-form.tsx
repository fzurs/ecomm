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
