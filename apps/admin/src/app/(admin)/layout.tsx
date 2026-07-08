"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { useQuery } from "@tanstack/react-query"
import { authUserRetrieveOptions } from "@workspace/api-client/query"
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

  const { isSuccess, isError } = useQuery(authUserRetrieveOptions())

  React.useEffect(() => {
    if (isError) router.push("/login")
  }, [isError, router])

  if (!isSuccess) return null

  return (
    <SidebarProvider
      defaultOpen={false}
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
