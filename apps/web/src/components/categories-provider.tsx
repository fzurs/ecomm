"use client"
import { Category } from "@workspace/api-client"
import * as React from "react"

export const CategoriesContext = React.createContext<Promise<
  Category[]
> | null>(null)

export default function CategoriesProvider({
  children,
  categoriesPromise,
}: {
  children: React.ReactNode
  categoriesPromise: Promise<Category[]>
}) {
  return (
    <CategoriesContext value={categoriesPromise}>{children}</CategoriesContext>
  )
}
