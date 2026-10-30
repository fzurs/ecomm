"use client"
import * as React from "react"
import type { Visitor } from "@/lib/dal"

export const VisitorContext =
  React.createContext<Promise<Visitor | null> | null>(null)

/** The logged-in customer (null if none), as a promise the header resolves. */
export function VisitorProvider({
  children,
  visitorPromise,
}: {
  children: React.ReactNode
  visitorPromise: Promise<Visitor | null>
}) {
  return <VisitorContext value={visitorPromise}>{children}</VisitorContext>
}
