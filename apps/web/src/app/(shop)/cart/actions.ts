"use server"
import {
  cartItemsCreate,
  cartItemsDestroy,
  cartItemsPartialUpdate,
} from "@workspace/api-client"
import { refresh } from "next/cache"
import { djangoFetch, failedResponse } from "@/lib/django"

export type CartResult = { error?: string }

// The cart is in the visitor's session in Django: each change goes there with
// their cookies (djangoFetch), and refresh() redraws the header's count.

export async function addToCart(
  product: number,
  quantity: number
): Promise<CartResult> {
  return change(() =>
    djangoFetch((options) =>
      cartItemsCreate({
        ...options,
        body: { product, quantity },
        throwOnError: true,
      })
    )
  )
}

export async function updateCartItem(
  product: number,
  quantity: number
): Promise<CartResult> {
  return change(() =>
    djangoFetch((options) =>
      cartItemsPartialUpdate({
        ...options,
        path: { product },
        body: { quantity },
        throwOnError: true,
      })
    )
  )
}

export async function removeCartItem(product: number): Promise<CartResult> {
  return change(() =>
    djangoFetch((options) =>
      cartItemsDestroy({ ...options, path: { product }, throwOnError: true })
    )
  )
}

async function change(call: () => Promise<unknown>): Promise<CartResult> {
  try {
    await call()
  } catch (error) {
    const response = failedResponse(error)
    // DRF's errors: { field: [messages] }, e.g. a product no longer for sale.
    const messages = Object.values(
      (response?.status === 400 && (response.data as object)) || {}
    ).flat()
    return {
      error:
        typeof messages[0] === "string"
          ? messages[0]
          : "We couldn't update your cart. Try again.",
    }
  }
  refresh()
  return {}
}
