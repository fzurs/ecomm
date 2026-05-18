"use client"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { schemas } from "@workspace/api-client"
import z from "zod"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(schemas.Login),
    defaultValues: { username: "", password: "" },
  })

  const { mutate } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Login>) =>
      apiClient.auth_login_create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      router.push("/")
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((data) => mutate(data))}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      placeholder="francozursch123"
                      required
                      {...field}
                    />
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="******"
                      required
                      {...field}
                    />
                  </Field>
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
