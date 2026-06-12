"use client"
import z from "zod"
import * as React from "react"
import { schemas } from "@workspace/api-client"

type SidebarItems = {
  categories: z.infer<typeof schemas.Category>[]
  brands: z.infer<typeof schemas.Brand>[]
  featuredProducts: z.infer<typeof schemas.Product>[]
}

const SidebarItemsContext = React.createContext<Promise<SidebarItems> | null>(
  null
)

export function useSidebarItems() {
  const itemsPromise = React.useContext(SidebarItemsContext)
  if (!itemsPromise) throw "SidebarItemsContext needs provider."
  return React.use(itemsPromise)
}

export function SidebarItemsProvider({
  children,
  itemsPromise,
}: {
  itemsPromise: Promise<SidebarItems>
  children: React.ReactNode
}) {
  return (
    <SidebarItemsContext value={itemsPromise}>{children}</SidebarItemsContext>
  )
}
