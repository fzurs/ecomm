"use client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { CreditCardIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { payOrder } from "../actions"

/** Goes to Mercado Pago to pay the order. */
export function PayButton({
  number,
  children = "Pay with Mercado Pago",
}: {
  number: string
  children?: React.ReactNode
}) {
  const [pending, startTransition] = React.useTransition()
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          // Only an error comes back: otherwise it's on its way to Mercado Pago.
          const { error } = await payOrder(number)
          toast.error(error)
        })
      }
    >
      {pending ? <Spinner /> : <CreditCardIcon />}
      {children}
    </Button>
  )
}
