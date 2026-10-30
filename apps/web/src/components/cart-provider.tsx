"use client"
import type { Cart } from "@workspace/api-client"
import * as React from "react"

export const CartContext = React.createContext<Promise<Cart> | null>(null)

/** The visitor's cart, as a promise the header resolves (like the session). */
export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode
  cartPromise: Promise<Cart>
}) {
  return <CartContext value={cartPromise}>{children}</CartContext>
}
