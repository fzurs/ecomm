"use client"
import { schemas } from "@workspace/api-client"
import * as React from "react"
import z from "zod"

type Brands = z.infer<typeof schemas.Brand>[]

export const BrandsContext = React.createContext<Promise<Brands> | null>(null)

export default function BrandsProvider({
  children,
  brandsPromise,
}: {
  children: React.ReactNode
  brandsPromise: Promise<Brands>
}) {
  return <BrandsContext value={brandsPromise}>{children}</BrandsContext>
}
