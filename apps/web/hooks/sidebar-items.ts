"use client"
import { schemas } from "@workspace/api-client"
import * as React from "react"

export const SidebarItemsContext = React.createContext<{
  categories: Promise<(typeof schemas.Category._type)[]>
  brands: Promise<(typeof schemas.Brand._type)[]>
} | null>(null)

export function useSidebarItems() {
  const promise = React.useContext(SidebarItemsContext)
  if (!promise) return { categories: [], brands: [] }
  return {
    brands: React.use(promise.brands),
    categories: React.use(promise.categories),
  }
}
