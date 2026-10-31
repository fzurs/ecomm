"use client"
import { useRouter } from "next/navigation"
import * as React from "react"

/**
 * Reads the order again every few seconds for a minute: Mercado Pago confirms
 * a payment to the API (its webhook), not to the page it comes back to.
 */
export function RefreshWhileWaiting({
  every = 5000,
  times = 12,
}: {
  every?: number
  times?: number
}) {
  const router = useRouter()
  React.useEffect(() => {
    let count = 0
    const timer = setInterval(() => {
      if (++count > times) return clearInterval(timer)
      router.refresh()
    }, every)
    return () => clearInterval(timer)
  }, [router, every, times])
  return null
}
