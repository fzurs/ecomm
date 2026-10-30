"use client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { ShoppingCartIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { QuantityInput } from "@/components/quantity-input"
import { addToCart } from "../../../cart/actions"

/** How many to buy and the button that puts them in the cart. */
export function AddToCart({
  productId,
  productName,
}: {
  productId: number
  productName: string
}) {
  const router = useRouter()
  const [quantity, setQuantity] = React.useState(1)
  const [pending, startTransition] = React.useTransition()

  function add() {
    startTransition(async () => {
      const { error } = await addToCart(productId, quantity)
      if (error) {
        toast.error(error)
        return
      }
      toast.success(`${productName} is in your cart.`, {
        action: { label: "View cart", onClick: () => router.push("/cart") },
      })
      setQuantity(1)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityInput
        value={quantity}
        onChange={setQuantity}
        disabled={pending}
      />
      <Button size="lg" onClick={add} disabled={pending}>
        {pending ? <Spinner /> : <ShoppingCartIcon />}
        Add to cart
      </Button>
    </div>
  )
}
