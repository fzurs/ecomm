"use client"
import { FullPageSpinner } from "@/components/auth-guard"
import { LoginForm } from "@/components/login-form"
import { useSession } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function Page() {
  const router = useRouter()
  const { status } = useSession()

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/")
  }, [status, router])

  // Don't flash the form to a user who is already logged in.
  if (status === "loading" || status === "authenticated") {
    return <FullPageSpinner />
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
