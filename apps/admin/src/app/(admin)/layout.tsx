"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { useSession } from "@/lib/query-options"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import "@workspace/ui/globals.css"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const { isSuccess, isError } = useSession()

  React.useEffect(() => {
    if (isError) router.push("/login")
  }, [isError, router])

  if (!isSuccess) return null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
