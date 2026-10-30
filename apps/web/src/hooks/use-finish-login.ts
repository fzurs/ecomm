"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { safeNext } from "@/lib/navigation"

/**
 * Once logged in (password, Google, a confirmed email): back to where the
 * customer was going. The refresh renders the server parts again (the header,
 * the page) with the new session cookie.
 */
export function useFinishLogin() {
  const router = useRouter()
  const next = useSearchParams().get("next")

  return (fallback = "/") => {
    router.replace(safeNext(next, fallback))
    router.refresh()
  }
}
