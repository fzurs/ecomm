"use client"

import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { logout } from "@/lib/allauth"

/**
 * Logs out, and renders the server parts again without the session: the
 * header, and the account pages, which go home.
 */
export function useLogout() {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = React.useTransition()

  const logOut = () =>
    startTransition(async () => {
      await logout()
      if (pathname.startsWith("/account")) router.replace("/")
      router.refresh()
    })

  return { logOut, pending }
}
