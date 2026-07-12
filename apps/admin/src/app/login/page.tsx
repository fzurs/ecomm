"use client"
import { LoginForm } from "@/components/login-form"
import { useQuery } from "@tanstack/react-query"
import { authUserRetrieveOptions } from "@workspace/api-client/query"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function Page() {
  const router = useRouter()

  const { isSuccess } = useQuery({ ...authUserRetrieveOptions(), retry: false })

  React.useEffect(() => {
    if (isSuccess) router.push("/")
  }, [isSuccess, router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
