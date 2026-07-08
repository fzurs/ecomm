"use client"
import { Brand } from "@workspace/api-client"
import * as React from "react"

export const BrandsContext = React.createContext<Promise<Brand[]> | null>(null)

export default function BrandsProvider({
  children,
  brandsPromise,
}: {
  children: React.ReactNode
  brandsPromise: Promise<Brand[]>
}) {
  return <BrandsContext value={brandsPromise}>{children}</BrandsContext>
}
