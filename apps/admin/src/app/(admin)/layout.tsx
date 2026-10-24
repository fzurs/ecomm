"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AssistantProvider } from "@/components/assistant/assistant-provider"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import "@workspace/ui/globals.css"
import * as React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider
        className="[&_[data-slot=sidebar-container]]:duration-100 [&_[data-slot=sidebar-gap]]:duration-100"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <AssistantProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </AssistantProvider>
      </SidebarProvider>
    </AuthGuard>
  )
}
