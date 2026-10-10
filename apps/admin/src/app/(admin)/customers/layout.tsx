"use client"
import { RowActionsProvider } from "./_components/customer-provider"

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RowActionsProvider>{children}</RowActionsProvider>
}
