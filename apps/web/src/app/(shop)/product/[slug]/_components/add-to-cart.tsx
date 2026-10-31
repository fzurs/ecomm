"use client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { ShoppingCartIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { MAX_QUANTITY, QuantityInput } from "@/components/quantity-input"
import { addToCart } from "../../../cart/actions"

/** How many to buy, up to the stock, and the button that puts them in the
 * cart. The page's stock may be hours old: the API caps it again. */
export function AddToCart({
  productId,
  productName,
  stock,
}: {
  productId: number
  productName: string
  stock: number
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
        max={Math.min(stock, MAX_QUANTITY)}
        disabled={pending}
      />
      <Button size="lg" onClick={add} disabled={pending}>
        {pending ? <Spinner /> : <ShoppingCartIcon />}
        Add to cart
      </Button>
    </div>
  )
}
