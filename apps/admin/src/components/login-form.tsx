"use client"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { schemas } from "@workspace/api-client"
import z from "zod"
import { useRouter } from "next/navigation"
import { useAppForm } from "@/hooks/form"

function useLoginForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Login>) =>
      apiClient.auth_login_create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      router.push("/")
    },
  })

  const form = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    } as z.infer<typeof schemas.Login>,
    validators: {
      onSubmit: schemas.Login,
    },
    onSubmit: ({ value }) => mutate(value),
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
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.AppField
                name="username"
                children={(field) => (
                  <field.Field>
                    <field.Label>Username</field.Label>
                    <field.Input placeholder="francozursch123" required />
                    <field.Message />
                  </field.Field>
                )}
              />
              <form.AppField
                name="email"
                children={(field) => (
                  <field.Field>
                    <field.Label>Email</field.Label>
                    <field.Input
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                    <field.Message />
                  </field.Field>
                )}
              />
              <form.AppField
                name="password"
                children={(field) => (
                  <field.Field>
                    <field.Label>Password</field.Label>
                    <field.Input
                      type="password"
                      placeholder="******"
                      required
                    />
                    <field.Message />
                  </field.Field>
                )}
              />
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
