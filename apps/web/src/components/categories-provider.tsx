"use client"
import { schemas } from "@workspace/api-client"
import * as React from "react"
import z from "zod"

type Categories = z.infer<typeof schemas.Category>[]

export const CategoriesContext =
  React.createContext<Promise<Categories> | null>(null)

export default function CategoriesProvider({
  children,
  categoriesPromise,
}: {
  children: React.ReactNode
  categoriesPromise: Promise<Categories>
}) {
  return (
    <CategoriesContext value={categoriesPromise}>{children}</CategoriesContext>
  )
}
