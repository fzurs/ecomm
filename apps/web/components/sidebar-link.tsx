"use client"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

export function SidebarMenuLink({
  href,
  ...props
}: React.ComponentProps<typeof Link>) {
  const pathname = usePathname()

  return (
    <SidebarMenuButton isActive={Boolean(href && pathname === href)} asChild>
      <Link href={href} {...props} />
    </SidebarMenuButton>
  )
}
