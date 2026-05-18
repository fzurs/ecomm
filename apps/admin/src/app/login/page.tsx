"use client"
import { LoginForm } from "@/components/login-form"
import { useSession } from "@/lib/query-options"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function Page() {
  const router = useRouter()

  const { isSuccess } = useSession()

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
